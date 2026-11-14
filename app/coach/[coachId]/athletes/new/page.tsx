import { createClient } from "@/lib/supabase/server";
import AddAthleteForm from "./AddAthleteForm";

type PageProps = {
    params: Promise<{
        coachId: string;
    }>;
};

export default async function AddAthletePage({ params }: PageProps) {
    const { coachId } = await params;
    const supabase = await createClient();

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

    const [{ data: partnerAthletes, error: partnersError }, { error: externalColumnError }, { data: externalAthletes, error: externalPartnersError }] = await Promise.all([
        supabase.from("athletes").select("id, name").order("name"),
        supabase.from("athletes").select("external_synchro_partner_id").limit(0),
        supabase.from("external_athletes").select("id, name, club").order("name"),
    ]);

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach Edit
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    Add Athlete
                </h1>

                <AddAthleteForm coachId={coachId} triLevels={levelOptions} triLevelsError={levelError}
                    partnerAthletes={partnerAthletes ?? []}
                    partnersError={partnersError ? "Club athletes could not be loaded. Reload to try again." : undefined}
                    externalPartnerAvailable={!externalColumnError}
                    externalAthletes={externalAthletes ?? []}
                    externalPartnersError={externalPartnersError ? "External athletes could not be loaded. Check read access to external_athletes." : undefined} />
            </div>
        </main>
    );
}