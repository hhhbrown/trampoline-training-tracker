import { checkDmtSpecials, checkDmtSetSpecials, dmtMountBonus, dmtJuniorMountBonus } from "@/lib/dmt-specials";
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
                    const checks = set.passes.map((pass) => ({ pass, check: checkDmtPassDD(pass, lookup.entries, rule, level?.name ?? athlete.dmt_level ?? ""), specials: checkDmtSpecials(pass, level?.name ?? athlete.dmt_level ?? "", lookup.entries) }));
                    const setSpecials = checkDmtSetSpecials(set, level?.name ?? athlete.dmt_level ?? "", lookup.entries);
                    const mountBonus = dmtMountBonus(set, level?.name ?? athlete.dmt_level ?? "");
                    const setFailed = setSpecials.some((special) => special.status === "unmet");
                    const under = checks.filter(({ check }) => check.status === "penalty").length;
                    const warnings = checks.filter(({ check }) => check.status === "warning").length;
                    const over = checks.filter(({ check }) => check.status === "over").length;
                    const specialFailures = checks.filter(({ specials }) => specials.some((special) => special.status === "unmet")).length;
                    const incomplete = setSpecials.some((special) => special.status === "unknown") || checks.some(({ check, specials }) => check.status === "unknown" || specials.some((special) => special.status === "unknown"));
                    const allMet = setSpecials.every((special) => special.status === "met") && checks.every(({ check, specials }) => check.status === "met" && specials.every((special) => special.status === "met"));
                    const hasSpecials = setSpecials.length > 0 || checks.some(({ specials }) => specials.length > 0);
                    const summary = setFailed ? "Set requirements not met" : specialFailures ? `${specialFailures} ${specialFailures === 1 ? "pass has" : "passes have"} unmet special requirements` : under ? `${under} ${under === 1 ? "pass" : "passes"} below minimum DD` : warnings ? `${warnings} ${warnings === 1 ? "pass" : "passes"} below minimum DD · no penalty` : incomplete ? "Checks incomplete" : over ? `${over} ${over === 1 ? "pass" : "passes"} above the level range` : hasSpecials ? "All pass requirements met" : "All passes meet DD requirements";
                    const headerStyle = allMet ? "bg-emerald-50 text-emerald-950" : under || specialFailures || setFailed ? "bg-red-50 text-red-950" : "bg-amber-50 text-amber-950";
                    return (
                        <details key={set.id ?? index} className="overflow-hidden rounded-xl border border-zinc-200">
                            <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${headerStyle}`}>
                                <span className="text-lg font-bold">{set.name || `Set ${index + 1}`}</span>
                                <span className="mt-2 block text-sm font-semibold">{summary}</span>
                            </summary>
                            <ul className="space-y-3 p-4">
                                {setSpecials.map((special) => <li key={special.title} className={`rounded-xl border p-4 ${special.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : special.status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}><p className="font-bold"><span aria-hidden="true">{special.status === "met" ? "✓" : special.status === "unmet" ? "✕" : "!"}</span>{" "}{special.title}</p><p className="mt-1 text-sm">{special.message}</p></li>)}
                                {/^level\s+2$/i.test(level?.name ?? athlete.dmt_level ?? "") && <li className="rounded-xl bg-red-50 p-4 text-red-900"><p className="font-bold">Mount bonus: +{mountBonus.total.toFixed(2)} points</p><p className="mt-1 text-sm">{mountBonus.codes.length ? mountBonus.codes.join(", ") : "No qualifying 41 mounts"} · 0.50 per different shape, counted once per set.</p></li>}
                                {checks.map(({ pass, check, specials }) => {
                                    const juniorBonus = dmtJuniorMountBonus(pass, level?.name ?? athlete.dmt_level ?? "", athlete.gender);
                                    const style = check.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : check.status === "penalty" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900";
                                    return <li key={pass.passNumber} className="space-y-2">
                                        <div className={`flex items-start gap-3 rounded-xl border p-4 ${style}`}>
                                        <span aria-hidden="true" className="text-xl font-bold">{check.status === "met" ? "✓" : check.status === "penalty" ? "✕" : "!"}</span>
                                        <div>
                                            <p><span className="text-lg font-bold">Pass {pass.passNumber} DD: {check.status === "unknown" ? "Not confirmed" : check.total?.toFixed(2)}</span>{" "}<span className="text-sm font-medium">({dmtDDRange(rule)})</span></p>
                                            <p className="mt-1 text-sm font-semibold">{check.message}</p>
                                            {juniorBonus > 0 && <p className="mt-2 text-sm font-bold">Mount bonus: +{juniorBonus.toFixed(2)} points · 8-1&lt; mount</p>}
                                        </div>
                                        </div>
                                        {specials.length > 0 && <ul className="space-y-2">{specials.map((special) => (
                                            <li key={special.title} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${special.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : special.status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                                                <span aria-hidden="true" className="font-bold">{special.status === "met" ? "✓" : special.status === "unmet" ? "✕" : "!"}</span>
                                                <div><p className="text-sm font-bold">{special.title}</p><p className="mt-1 text-sm">{special.message}</p></div>
                                            </li>
                                        ))}</ul>}
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
