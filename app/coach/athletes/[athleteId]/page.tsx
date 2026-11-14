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
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach View
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    Edit Athlete
                </h1>

                <h2 className="mt-2 text-1xl font-bold text-black">
                    {athlete?.name}
                </h2>

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