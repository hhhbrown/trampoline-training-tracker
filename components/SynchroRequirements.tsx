import { canShowSynchroRoutine } from "@/lib/athlete-events";
import { matchCompetitionLevel } from "@/lib/competition-age";
import { matchDDRequirement } from "@/lib/competition-dd";
import { resolveSynchroPartner, type SynchroProfile } from "@/lib/synchro-partner";
import { sharedSynchroAthleteIds } from "@/lib/synchro-routines";
import { synDDCheck, synParticipationNote } from "@/lib/syn-requirements";
import { createClient } from "@/lib/supabase/server";

export default async function SynchroRequirements({ athlete }: {
    athlete: SynchroProfile & { gender: string | null };
}) {
    const pairing = await resolveSynchroPartner(athlete);
    if (!canShowSynchroRoutine(athlete, pairing)) return null;
    const synLevel = athlete.syn_level || pairing.partner?.syn_level || "";
    const supabase = await createClient();
    const ids = sharedSynchroAthleteIds(athlete, pairing);
    const [{ data: levels, error: levelsError }, { data: routines, error: routineError }] = await Promise.all([
        supabase.from("competition_levels").select("id, name, discipline, min_age, max_age").eq("discipline", "TRS"),
        supabase.from("synchro_routines").select("difficulty, skills").in("athlete_id", ids).order("id").limit(1),
    ]);
    const level = matchCompetitionLevel((levels ?? []).filter((entry) => !/mixed/i.test(entry.name)), synLevel, "TRS");
    const { data: rules, error: ruleError } = level?.id != null
        ? await supabase.from("level_dd_requirements").select("level_id, gender, min_dd, max_dd").eq("level_id", level.id)
        : { data: [], error: null };
    const rule = matchDDRequirement(rules ?? [], level?.id, athlete.gender);
    const dd = routines?.[0]?.skills?.length ? routines[0].difficulty : null;
    const check = synDDCheck(dd, rule, level?.name ?? synLevel);
    const error = /mixed/i.test(synLevel) ? "Mixed SYN is not supported in this application."
        : levelsError || ruleError ? "SYN DD requirements could not be loaded."
        : routineError ? "The shared synchro routine could not be loaded." : null;
    const status = error ? "unknown" : check.status;
    const style = status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : status === "penalty" ? "border-red-200 bg-red-50 text-red-900"
        : "border-amber-200 bg-amber-50 text-amber-900";

    return (
        <section aria-labelledby="syn-requirements-heading" className="mt-7 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <h2 id="syn-requirements-heading" className="border-b border-red-100 bg-red-50 px-5 py-4 text-2xl font-extrabold tracking-tight text-black">SYN {synLevel}</h2>
            <div className="space-y-3 p-5">
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${style}`}>
                    <span aria-hidden="true" className="text-xl font-bold">{status === "met" ? "✓" : status === "penalty" ? "✕" : "!"}</span>
                    <div>
                        <p><span className="text-lg font-bold">DD: {dd != null ? dd.toFixed(2) : "Not set"}</span>{check.range && !error && <> <span className="text-sm font-medium">({check.range})</span></>}</p>
                        <p className="mt-1 text-sm font-semibold">{error ?? check.message}</p>
                    </div>
                </div>
                {synParticipationNote(synLevel) && <p className="text-sm leading-6 text-black">Participation in gendered TRS at Level 5 or above means this pair cannot participate in Mixed TRS.</p>}
            </div>
        </section>
    );
}
