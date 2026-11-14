import { competesInEvent } from "@/lib/athlete-events";
import { matchCompetitionLevel } from "@/lib/competition-age";
import { matchDDRequirement } from "@/lib/competition-dd";
import { loadDmtSets } from "@/lib/dmt-sets";
import { loadDmtDDLookup } from "@/lib/dmt-dd";
import { checkDmtPassDD, dmtDDRange } from "@/lib/dmt-requirements";
import { createClient } from "@/lib/supabase/server";

export default async function DmtCompetitionRequirements({ athlete }: { athlete: { id: number; dmt_level: string | null; gender: string | null } }) {
    if (!competesInEvent(athlete.dmt_level)) return null;
    const supabase = await createClient();
    const [{ data: levels, error: levelError }, sets, lookup] = await Promise.all([
        supabase.from("competition_levels").select("id, name, discipline, min_age, max_age").eq("discipline", "DMT"),
        loadDmtSets(supabase, athlete.id, athlete.dmt_level),
        loadDmtDDLookup(supabase),
    ]);
    const level = matchCompetitionLevel(levels ?? [], athlete.dmt_level, "DMT");
    const { data: rules, error: rulesError } = level?.id != null
        ? await supabase.from("level_dd_requirements").select("level_id, gender, min_dd, max_dd").eq("level_id", level.id)
        : { data: [], error: null };
    const rule = matchDDRequirement(rules ?? [], level?.id, athlete.gender);
    const error = levelError || rulesError ? "DMT level DD requirements could not be loaded."
        : sets.error ?? lookup.error ?? (!rule ? "No matching DMT DD requirements found for this level and gender category." : null);
    const gender = athlete.gender?.trim().toLowerCase() === "male" ? "Men" : athlete.gender?.trim().toLowerCase() === "female" ? "Woman" : athlete.gender || "Gender not set";

    return (
        <section aria-labelledby="dmt-requirements-heading" className="mt-7 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <h2 id="dmt-requirements-heading" className="border-b border-red-100 bg-red-50 px-5 py-4 text-2xl font-extrabold tracking-tight text-red-950">DMT {level?.name ?? athlete.dmt_level} · {gender}</h2>
            <div className="space-y-4 p-5">
                {error || !rule ? <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : sets.drafts.map((set, index) => {
                    const checks = set.passes.map((pass) => ({ pass, check: checkDmtPassDD(pass, lookup.entries, rule) }));
                    const under = checks.filter(({ check }) => check.status === "under").length;
                    const over = checks.filter(({ check }) => check.status === "over").length;
                    const incomplete = checks.some(({ check }) => check.status === "unknown");
                    const allMet = checks.every(({ check }) => check.status === "met");
                    const summary = under ? `${under} ${under === 1 ? "pass" : "passes"} below minimum DD` : incomplete ? "DD checks incomplete" : over ? `${over} ${over === 1 ? "pass" : "passes"} above the level range` : "All passes meet DD requirements";
                    const headerStyle = allMet ? "bg-emerald-50 text-emerald-950" : under ? "bg-red-50 text-red-950" : "bg-amber-50 text-amber-950";
                    return (
                        <details key={set.id ?? index} className="overflow-hidden rounded-xl border border-zinc-200">
                            <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${headerStyle}`}>
                                <span className="text-lg font-bold">{set.name || `Set ${index + 1}`}</span>
                                <span className="mt-2 block text-sm font-semibold">{summary}</span>
                            </summary>
                            <ul className="space-y-3 p-4">
                                {checks.map(({ pass, check }) => {
                                    const style = check.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : check.status === "under" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900";
                                    return <li key={pass.passNumber} className={`flex items-start gap-3 rounded-xl border p-4 ${style}`}>
                                        <span aria-hidden="true" className="text-xl font-bold">{check.status === "met" ? "✓" : check.status === "under" ? "✕" : "!"}</span>
                                        <div>
                                            <p><span className="text-lg font-bold">Pass {pass.passNumber} DD: {check.status === "unknown" ? "Not confirmed" : check.total?.toFixed(2)}</span>{" "}<span className="text-sm font-medium">({dmtDDRange(rule)})</span></p>
                                            <p className="mt-1 text-sm font-semibold">{check.message}</p>
                                        </div>
                                    </li>;
                                })}
                            </ul>
                        </details>
                    );
                })}
            </div>
        </section>
    );
}
