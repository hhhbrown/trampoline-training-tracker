import { loadDmtDDLookup } from "@/lib/dmt-dd";
import { competesInEvent } from "@/lib/athlete-events";
import { emptyDmtSet, loadDmtSet } from "@/lib/dmt-sets";
import { sharedSynchroAthleteIds } from "@/lib/synchro-routines";
import { canShowSynchroRoutine } from "@/lib/athlete-events";
import { resolveSynchroPartner } from "@/lib/synchro-partner";
import { createClient } from "@/lib/supabase/server";
import EditRoutinesForm from "./EditRoutinesForm";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};

export default async function RoutinesPage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", Number(athleteId))
        .single();

    const coachId = athlete?.coach_id;

    const { data: routines } = await supabase
        .from("routines")
        .select("*")
        .eq("athlete_id", Number(athleteId))
        .single();

    const { data: ddLookup, error: ddLookupError } = await supabase
        .from("dd_lookup")
        .select("fig_code, difficulty");

    const pairing = athlete ? await resolveSynchroPartner(athlete) : undefined;
    const synAthleteIds = athlete ? sharedSynchroAthleteIds(athlete, pairing) : [Number(athleteId)];
    const { data: synRoutines, error: synSchemaError } = await supabase.from("synchro_routines")
        .select("id, athlete_id, routine_name, skills, difficulty, notes").in("athlete_id", synAthleteIds).order("id").limit(1);

    const [dmt, dmtDD] = competesInEvent(athlete?.dmt_level)
        ? await Promise.all([loadDmtSet(supabase, Number(athleteId), athlete?.dmt_level), loadDmtDDLookup(supabase)])
        : [{ draft: emptyDmtSet(), error: null }, { entries: [], error: null }];

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-10 pt-24 text-zinc-950 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-black">
                    Edit Routines
                </h1>

                <EditRoutinesForm
                    coachId={String(coachId)}
                    athleteId={athleteId}
                    athleteName={athlete?.name ?? ""}
                    routines={routines}
                    dmtLevel={athlete?.dmt_level ?? null}
                    dmtSet={dmt.draft}
                    dmtError={dmt.error}
                    dmtDDLookup={dmtDD.entries}
                    dmtDDLookupError={dmtDD.error}
                    synEligible={athlete ? canShowSynchroRoutine(athlete, pairing) : false}
                    synStorageAvailable={!synSchemaError}
                    synRoutines={synRoutines ?? []}
                    synAthleteIds={synAthleteIds}
                    synPartnerName={synAthleteIds.length > 1 ? pairing?.partner?.name : undefined}
                    ddLookup={ddLookup ?? []}
                    ddLookupError={ddLookupError
                        ? "Unable to load the DD lookup table. Enter DD manually or reload to try again."
                        : !ddLookup?.length
                          ? "No DD lookup entries are visible to the app. Check that the table is populated and its read policy allows access. You can still enter DD manually."
                          : undefined}
                />
            </div>
        </main>
    );
}
