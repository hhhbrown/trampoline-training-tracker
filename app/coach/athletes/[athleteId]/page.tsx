import BackLink from "@/components/BackLink";
import { resolveSynchroPartner } from "@/lib/synchro-partner";
import { createClient } from "@/lib/supabase/server";
import EditAthleteForm from "./EditAthleteForm";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function CoachEditAthletePage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", Number(athleteId))
        .single();

    const { data: coaches } = await supabase
        .from("coaches")
        .select("id, name")
        .order("id");

    if (error) {
        return <p className="p-8 text-red-600">Error: {error.message}</p>;
    }

    const { data: triLevels, error: triLevelsError } = await supabase
        .from("competition_levels")
        .select("name")
        .eq("discipline", "TRI")
        .order("min_age")
        .order("name");
    const levelOptions = (triLevels ?? []).map((level) => level.name);
    const levelError = triLevelsError || !levelOptions.length
        ? "TRI levels could not be loaded. Existing values will be preserved; reload to try again."
        : undefined;

    const pairing = await resolveSynchroPartner(athlete);
    const displayedAthlete = pairing.inferred && pairing.partner
        ? { ...athlete, syn_level: athlete.syn_level || pairing.partner.syn_level, synchro_partner_id: pairing.partner.id }
        : athlete;

    const [{ data: partnerAthletes, error: partnersError }, { error: externalColumnError }, { data: externalAthletes, error: externalPartnersError }] = await Promise.all([
        supabase.from("athletes").select("id, name").order("name"),
        supabase.from("athletes").select("external_synchro_partner_id").limit(0),
        supabase.from("external_athletes").select("id, name, club").order("name"),
    ]);

    return (
        <main className="min-h-screen bg-[#fffaf0] px-4 py-10 text-black" style={{ colorScheme: "light" }}>
            <div className="mx-auto max-w-2xl">
                <BackLink href={`/coach/${athlete.coach_id}/athletes`}>Back to athletes</BackLink>
                <header className="mt-6 border-b-2 border-red-700 pb-5">
                    <p className="text-sm font-semibold text-red-800">Edit Athlete</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <h1 className="min-w-0 break-words text-3xl font-bold text-black">{athlete.name}</h1>
                        {athlete.level && <span className="rounded-md bg-black px-2 py-1 text-sm font-semibold text-white">{athlete.level}</span>}
                    </div>
                </header>

                <EditAthleteForm athlete={displayedAthlete} coaches={coaches ?? []} triLevels={levelOptions} triLevelsError={levelError}
                    partnerAthletes={partnerAthletes ?? []}
                    partnersError={partnersError ? "Club athletes could not be loaded. Reload to try again." : undefined}
                    externalPartnerAvailable={!externalColumnError}
                    externalAthletes={externalAthletes ?? []}
                    externalPartnersError={externalPartnersError ? "External athletes could not be loaded. Check read access to external_athletes." : undefined} />
            </div>
        </main>
    );
}