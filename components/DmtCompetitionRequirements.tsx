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
    const gender = athlete.gender?.trim().toLowerCase() === "male" ? "Men" : athlete.gender?.trim().toLowerCase() === "female" ? "Women" : athlete.gender || "Gender not set";

    return (
        <section aria-labelledby="dmt-requirements-heading" className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <h2 id="dmt-requirements-heading" className="border-b border-red-100 bg-red-50 px-5 py-4 text-2xl font-extrabold tracking-tight text-black">DMT {level?.name ?? athlete.dmt_level} · {gender}</h2>
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
                        <details key={set.id ?? index} open={index === 0} className="overflow-hidden rounded-xl border border-red-200">
                            <summary className={`cursor-pointer px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${headerStyle}`}>
                                <span className="text-lg font-bold text-black">{set.name || `Set ${index + 1}`}</span>
                                <span className="ml-2 text-sm font-medium text-black">{index === 0 ? "Competitive set" : "Training set"}</span>
                                <span className="mt-1 block text-sm font-semibold">{summary}</span>
                            </summary>
                            <div className="p-4">
                                <p className="mb-3 text-sm font-semibold text-black">{dmtDDRange(rule)} · per pass</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <caption className="sr-only">Pass difficulty and requirements for {set.name || `Set ${index + 1}`}</caption>
                                        <thead className="border-b-2 border-black text-black"><tr><th scope="col" className="py-2 pr-3">Pass</th><th scope="col" className="py-2 pr-3">DD</th><th scope="col" className="py-2">Check</th></tr></thead>
                                        <tbody>{checks.map(({ pass, check, specials }) => {
                                            const juniorBonus = dmtJuniorMountBonus(pass, level?.name ?? athlete.dmt_level ?? "", athlete.gender);
                                            const failedSpecials = specials.some((special) => special.status === "unmet");
                                            const unknownSpecials = specials.some((special) => special.status === "unknown");
                                            const failed = check.status === "penalty" || failedSpecials;
                                            const passed = check.status === "met" && !failedSpecials && !unknownSpecials;
                                            return <tr key={pass.passNumber} className="border-b border-red-100 align-top">
                                                <th scope="row" className="py-3 pr-3 font-bold text-black">{pass.passNumber}</th>
                                                <td className="py-3 pr-3 font-bold tabular-nums text-black">{check.status === "unknown" ? "—" : check.total?.toFixed(2)}</td>
                                                <td className="py-3">
                                                    <p className={`font-semibold ${failed ? "text-red-800" : passed ? "text-emerald-800" : "text-amber-900"}`}>
                                                        {passed ? "✓ Meets requirements" : failed ? "✕ Check requirements" : "! Review needed"}
                                                    </p>
                                                    {check.status !== "met" && <p className="mt-1 text-black">{check.message}</p>}
                                                    {failedSpecials && <p className="mt-1 text-red-800">{specials.filter((special) => special.status === "unmet").map((special) => special.title).join("; ")}</p>}
                                                    {juniorBonus > 0 && <p className="mt-1 font-semibold text-black">Mount bonus: +{juniorBonus.toFixed(2)} points</p>}
                                                </td>
                                            </tr>;
                                        })}</tbody>
                                    </table>
                                </div>
                                {/^level\s+2$/i.test(level?.name ?? athlete.dmt_level ?? "") && <p className="mt-3 text-sm font-semibold text-black">Mount bonus: +{mountBonus.total.toFixed(2)} points · {mountBonus.codes.length ? mountBonus.codes.join(", ") : "No qualifying 41 mounts"}</p>}
                                {hasSpecials && <details className="mt-4 border-t border-red-200 pt-3">
                                    <summary className="cursor-pointer text-sm font-bold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">Special requirements · details</summary>
                                    <div className="mt-3 space-y-4">
                                        {setSpecials.length > 0 && <div><h3 className="mb-2 text-sm font-bold text-black">Across the set</h3><SpecialList checks={setSpecials} /></div>}
                                        {checks.filter(({ specials }) => specials.length > 0).map(({ pass, specials }) => <div key={pass.passNumber}><h3 className="mb-2 text-sm font-bold text-black">Pass {pass.passNumber}</h3><SpecialList checks={specials} /></div>)}
                                    </div>
                                </details>}
                            </div>
                        </details>
                    );
                })}
            </div>
        </section>
    );
}

function SpecialList({ checks }: { checks: ReturnType<typeof checkDmtSpecials> }) {
    return <ul className="divide-y divide-red-100 text-sm">{checks.map((check) => <li key={check.title} className="flex items-start gap-2 py-2">
        <span className={`font-bold ${check.status === "met" ? "text-emerald-800" : check.status === "unmet" ? "text-red-800" : "text-amber-900"}`} aria-label={check.status === "met" ? "Met" : check.status === "unmet" ? "Not met" : "Check incomplete"}>{check.status === "met" ? "✓" : check.status === "unmet" ? "✕" : "!"}</span>
        <div className="text-black"><p className="font-semibold">{check.title}</p><p className="mt-1">{check.message}</p></div>
    </li>)}</ul>;
}
