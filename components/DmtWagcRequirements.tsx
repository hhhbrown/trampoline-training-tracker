import { competitionAge } from "@/lib/competition-age";
import { loadDmtSets } from "@/lib/dmt-sets";
import { loadDmtDDLookup } from "@/lib/dmt-dd";
import { dmtWagcRounds } from "@/lib/dmt-nationals";
import { mobilityRoutineChecks } from "@/lib/mobility";
import { WAGC_AGE_CUTOFF_YEAR, WAGC_RULESET_YEAR, wagcAgeGroup, supportsWagc } from "@/lib/wagc";
import { createClient } from "@/lib/supabase/server";

export default async function DmtWagcRequirements({ athlete }: {
    athlete: { id: number; dmt_level: string | null; gender: string | null; date_of_birth: string | null };
}) {
    if (!supportsWagc(athlete.dmt_level)) return null;
    const client = await createClient();
    const [requirements, sets, lookup] = await Promise.all([
        client.from("qualification_requirements")
            .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year, discipline")
            .eq("qualification_type", "international").eq("discipline", "DMT")
            .eq("ruleset_year", WAGC_RULESET_YEAR).ilike("pathway_name", "%WAGC%").order("id"),
        loadDmtSets(client, athlete.id, athlete.dmt_level),
        loadDmtDDLookup(client),
    ]);
    const age = competitionAge(athlete.date_of_birth, WAGC_AGE_CUTOFF_YEAR);
    const rule = wagcAgeGroup(requirements.data ?? [], athlete.date_of_birth, athlete.gender, "DMT");
    const petition = age != null && age >= 11 && age <= 12;
    // Qualification round only: finals and bonuses never contribute to WAGC DD.
    const results = rule ? dmtWagcRounds(sets.drafts, lookup.entries).map((round) => ({ round, checks: mobilityRoutineChecks(rule, round) })) : [];
    const issue = requirements.error ? "DMT WAGC standards could not be loaded. Check database read permissions."
        : age == null ? "Date of birth required to check WAGC age eligibility."
        : age < 11 ? "Underage athletes are not considered."
        : age > 21 ? "The athlete is outside the WAGC age groups."
        : !rule ? "No matching DMT WAGC standard found for this age group and gender." : null;
    const routineError = sets.error ?? lookup.error;
    const met = !issue && !routineError && results.some(({ checks }) => checks.every((check) => check.status === "met"));
    const failed = !routineError && results.length > 0 && results.every(({ checks }) => checks.some((check) => check.status === "unmet"));
    const status = age != null && (age < 11 || age > 21) || failed ? "unmet" : met && !petition ? "met" : "unknown";
    const style = status === "met" ? "bg-emerald-50 text-emerald-950" : status === "unmet" ? "bg-red-50 text-red-950" : "bg-amber-50 text-amber-950";
    return <section aria-labelledby="dmt-wagc-heading" className="mt-7 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="dmt-wagc-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950">WAGC · DMT</h2>
        <p className="mt-2 text-sm text-zinc-600">{WAGC_RULESET_YEAR} rules · Age cutoff: December 31, {WAGC_AGE_CUTOFF_YEAR}</p>
        <details className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
            <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${style}`}>
                <span className="text-lg font-bold">{rule ? `Ages ${rule.min_age}–${rule.max_age}` : "WAGC requirements"}</span>
                <span className="mt-2 block text-sm font-semibold">{issue ?? (petition ? `${met ? "DD target met · " : ""}Provincial petition required` : met ? "Profile DD requirement met" : failed ? "DD requirement not met" : "Checks incomplete")}</span>
            </summary>
            <div className="space-y-4 p-4">
                {issue ? <p className="text-sm text-amber-900">{issue}</p> : rule && <>
                    <p className="font-bold">Age: {age} (as of December 31, {WAGC_AGE_CUTOFF_YEAR})</p>
                    {petition && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Ages 11–12 are considered case by case. The province must submit a petition for a TTPC decision.</p>}
                    {rule.minimum_score != null && <p className="rounded-lg bg-zinc-50 p-3 text-sm"><strong>Score target: {Number(rule.minimum_score).toFixed(2)}</strong> (total of both passes in the Qualification Round)</p>}
                    {routineError ? <p className="text-sm text-amber-900">{routineError}</p> : results.map(({ round, checks }) => <div key={round.name}>
                        <h3 className="mb-2 font-bold">{round.name}</h3>
                        <ul className="space-y-2">{checks.map((check) => <li key={check.title} className={`rounded-xl border p-3 ${check.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : check.status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                            <p className="font-bold">{check.status === "met" ? "✓" : check.status === "unmet" ? "✕" : "!"} {check.title}</p><p className="mt-1 text-sm">{check.detail}</p>
                        </li>)}</ul>
                    </div>)}
                </>}
                <div className="space-y-2 border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600">
                    <p>Bonuses do not count toward WAGC qualification. Both score and minimum DD must be achieved in the same Qualification Round. Scores are shown for reference; saved passes indicate DD readiness only.</p>
                    <p>Priority goes to eligible top-eight Senior National Team athletes not attending Worlds in DMT, top-four Development athletes, and top-four Junior athletes, using rankings at the conclusion of the 2026 Canadian Championships. National Team members have priority; ranking among them follows the normal selection procedure. Ages 17–21 prioritize Senior, then Development athletes.</p>
                    <p>To complete the delegation, the World Games Sub-Committee may consider athletes who meet the score requirement but not the DD requirement. This is discretionary and does not mark the DD requirement as met.</p>
                    <p>Bonuses may count toward National Team qualification. This check does not confirm team selection or a qualifying competition result.</p>
                </div>
            </div>
        </details>
    </section>;
}
