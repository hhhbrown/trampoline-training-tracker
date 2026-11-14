import { loadDmtDDLookup } from "@/lib/dmt-dd";
import DmtSetSummary from "@/components/DmtSetSummary";
import { emptyDmtSet, loadDmtSets } from "@/lib/dmt-sets";
import { sharedSynchroAthleteIds } from "@/lib/synchro-routines";
import { resolveSynchroPartner } from "@/lib/synchro-partner";
import { canShowSynchroRoutine, competesInEvent } from "@/lib/athlete-events";
import AthleteEventSummary from "@/components/AthleteEventSummary";
import { createClient } from "@/lib/supabase/server";
import { compulsorySkills } from "@/lib/compulsories";
import BackLink from "@/components/BackLink";

type PageProps = {
    params: Promise<{
        coachId: string;
        athleteId: string;
    }>;
};

export default async function AthleteRoutinesPage({ params }: PageProps) {
    const { coachId, athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error: athleteError } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", Number(athleteId))
        .single();

    if (athleteError) {
        return <p className="p-8 text-red-600">Error: {athleteError.message}</p>;
    }

    const { data: routines, error: routinesError } = await supabase
        .from("routines")
        .select("*")
        .eq("athlete_id", Number(athleteId))
        .maybeSingle();

    if (routinesError) {
        return <p className="p-8 text-red-600">Error: {routinesError.message}</p>;
    }

    const pairing = await resolveSynchroPartner(athlete);
    const showSyn = canShowSynchroRoutine(athlete, pairing);
    const synAthleteIds = sharedSynchroAthleteIds(athlete, pairing);
    const { data: synRoutines, error: synError } = showSyn
        ? await supabase.from("synchro_routines").select("id, athlete_id, routine_name, skills, difficulty, notes").in("athlete_id", synAthleteIds).order("id").limit(1)
        : { data: [], error: null };

    const [dmt, dmtDD] = competesInEvent(athlete?.dmt_level)
        ? await Promise.all([loadDmtSets(supabase, Number(athleteId), athlete?.dmt_level), loadDmtDDLookup(supabase)])
        : [{ drafts: [emptyDmtSet()], error: null }, { entries: [], error: null }];

    const skills: string[] =
        routines?.compulsory === "Level 5+"
            ? (routines.custom_compulsory ?? "")
                .split("\n")
                .map((skill: string) => skill.trim())
                .filter(Boolean)
            : compulsorySkills[routines?.compulsory ?? ""] ?? [];

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-6 pt-24 text-zinc-950 sm:px-6 sm:pb-10">
            <div className="mx-auto max-w-5xl">
                <BackLink
                    href={`/athletes/${coachId}/${athleteId}`}
                >
                    Back to Dashboard
                </BackLink>

                <header className="mb-8 mt-6 border-b border-zinc-200 pb-8">
                    <p className="break-words text-3xl font-bold tracking-tight text-red-700 sm:text-4xl">{athlete.name}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                        <h1 className="text-sm font-semibold">Current Routines</h1>
                        {athlete.level && (
                            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
                                {athlete.level}
                            </span>
                        )}
                    </div>
                    <AthleteEventSummary athlete={athlete} />
                </header>

                <div className="space-y-10">
                    <section aria-labelledby="trampoline-heading">
                        <h2 id="trampoline-heading" className="mb-4 text-xl font-bold text-red-900">Trampoline</h2>
                        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <RoutineCard
                                title={routines?.compulsory === "Level 5+" ? "Compulsory" : routines?.compulsory || "Compulsory"}
                                value={skills.join("\n")}
                                emptyMessage="No compulsory routine selected yet."
                            />
                            <RoutineCard title="Optional A" value={routines?.optional_a} difficulty={routines?.optional_a_difficulty} />
                            <RoutineCard title="Optional B" value={routines?.optional_b} difficulty={routines?.optional_b_difficulty} />
                        </div>
                    </section>

                    {showSyn && (
                        <section aria-labelledby="synchro-heading">
                            <h2 id="synchro-heading" className="mb-4 text-xl font-bold text-red-900">Synchro</h2>
                            {synError ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Synchro routines could not be loaded. Please try again.</p>
                                : synRoutines?.length ? <div className="grid items-start gap-5 md:grid-cols-2">{synRoutines.map((routine) => (
                                    <div key={routine.id} className="space-y-3">
                                        <RoutineCard title={routine.routine_name} value={routine.skills.join("\n")} difficulty={routine.difficulty} />
                                    </div>
                                ))}</div> : <RoutineCard title="Synchro Routine" value={null} />}

                        </section>
                    )}

                    {competesInEvent(athlete.dmt_level) && <div className="space-y-8">{dmt.drafts.map((set, index) => <DmtSetSummary key={set.id ?? index} level={athlete.dmt_level} set={set} error={dmt.error} ddLookup={dmtDD.entries} ddLookupError={dmtDD.error} />)}</div>}

                    <section aria-labelledby="practice-heading">
                        <h2 id="practice-heading" className="mb-4 text-xl font-bold text-red-900">Skills & Notes</h2>
                        <div className="grid items-start gap-5 md:grid-cols-2">
                            <RoutineCard title="Skills" value={routines?.skills} numbered={false} />
                            <RoutineCard title="Notes" value={routines?.notes} numbered={false} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function RoutineCard({
    title,
    value,
    difficulty,
    numbered = true,
    emptyMessage = "Not added yet.",
}: {
    title: string;
    value: string | null | undefined;
    difficulty?: number | null;
    numbered?: boolean;
    emptyMessage?: string;
}) {
    const lines = (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-4">
                <h3 className="text-lg font-bold text-red-900">{title}</h3>
                {difficulty != null && (
                    <span className="rounded-lg bg-red-700 px-3 py-1.5 text-base font-bold tabular-nums text-white shadow-sm">
                        DD {difficulty.toFixed(2)}
                    </span>
                )}
            </div>

            {lines.length ? (
                numbered ? (
                    <ol className="divide-y divide-zinc-100">
                        {lines.map((line, index) => (
                            <li key={index} className="flex items-baseline gap-4 px-5 py-3.5">
                                <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-semibold tabular-nums text-red-700">
                                    {index + 1}
                                </span>
                                <span className="min-w-0 break-words text-base font-medium leading-7 text-zinc-900">{line}</span>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="whitespace-pre-line break-words px-5 py-5 text-base leading-7 text-zinc-800">{value}</p>
                )
            ) : (
                <p className="px-5 py-5 text-base leading-7 text-zinc-600">{emptyMessage}</p>
            )}
        </section>
    );
}
