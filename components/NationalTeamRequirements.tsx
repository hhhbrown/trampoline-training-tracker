import { competitionAge } from "@/lib/competition-age";
import { canShowSynchroRoutine } from "@/lib/athlete-events";
import { mobilityRoutineChecks, type MobilityRoutine, type QualificationRequirement } from "@/lib/mobility";
import { NATIONAL_TEAM_RULESET_YEAR, nationalTeamRules, nationalTeamEntryNote, nationalTeamCategoryEligible, supportsNationalTeam } from "@/lib/national-team";
import { resolveSynchroPartner, type SynchroProfile } from "@/lib/synchro-partner";
import { sharedSynchroAthleteIds } from "@/lib/synchro-routines";
import { createClient } from "@/lib/supabase/server";

export default async function NationalTeamRequirements({ athlete, year, routines, routinesError }: {
    athlete: SynchroProfile & { level: string | null; gender: string | null; date_of_birth: string | null };
    year: number; routines: MobilityRoutine[]; routinesError?: string;
}) {
    const client = await createClient();
    const pairing = await resolveSynchroPartner(athlete);
    const synLevel = athlete.syn_level || pairing.partner?.syn_level || null;
    const showSyn = canShowSynchroRoutine(athlete, pairing) && supportsNationalTeam(synLevel);
    if (!supportsNationalTeam(athlete.level) && !showSyn) return null;
    const [requirements, syn] = await Promise.all([
        client.from("qualification_requirements")
            .select("id, qualification_type, source_level_id, target_level_id, gender, min_age, max_age, minimum_score, minimum_dd, score_basis, pathway_name, description, required_skill, ruleset_year, discipline")
            .eq("qualification_type", "international").eq("ruleset_year", NATIONAL_TEAM_RULESET_YEAR)
            .in("discipline", ["TRI", "TRS"]).ilike("pathway_name", "National Team%"),
        showSyn ? client.from("synchro_routines").select("skills, difficulty").in("athlete_id", sharedSynchroAthleteIds(athlete, pairing)).order("id").limit(1)
            : Promise.resolve({ data: [], error: null }),
    ]);
    const synRoutine = syn.data?.[0];
    return <>
        {supportsNationalTeam(athlete.level) && <TeamSection discipline="TRI" profileLevel={athlete.level} athlete={athlete} year={year} requirements={requirements.data ?? []} routines={routines} error={requirements.error ? "National Team standards could not be loaded. Check database read permissions." : routinesError} />}
        {showSyn && <TeamSection discipline="TRS" profileLevel={synLevel} athlete={athlete} year={year} requirements={requirements.data ?? []}
            routines={synRoutine ? [{ name: "Synchro Routine", value: synRoutine.skills.join("\n"), difficulty: synRoutine.difficulty }] : []}
            error={requirements.error || syn.error ? "SYN National Team standards or shared routine could not be loaded." : undefined} />}
    </>;
}

function TeamSection({ discipline, profileLevel, athlete, year, requirements, routines, error }: {
    discipline: "TRI" | "TRS"; profileLevel: string | null;
    athlete: { date_of_birth: string | null; gender: string | null }; year: number;
    requirements: QualificationRequirement[]; routines: MobilityRoutine[]; error?: string;
}) {
    const age = competitionAge(athlete.date_of_birth, year);
    const rules = nationalTeamRules(requirements, discipline, athlete.gender, athlete.date_of_birth, year);
    return <section aria-labelledby={`national-team-${discipline}`} className="mt-7 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 id={`national-team-${discipline}`} className="text-2xl font-extrabold tracking-tight text-zinc-950">National Team · {discipline === "TRS" ? "SYN" : "TRI"}</h2>
        <p className="mt-2 text-sm text-zinc-600">{NATIONAL_TEAM_RULESET_YEAR} rules · Age: {age ?? "Not available"} (December 31, {year})</p>
        {error && <p role="status" className="mt-4 text-sm text-amber-900">{error}</p>}
        {!rules.length && !error && <p className="mt-4 text-sm text-amber-900">No matching National Team standard for this age and gender category is visible in the database.</p>}
        {rules.map((rule) => {
            const results = routines.filter((routine) => routine.value?.trim()).map((routine) => ({ routine, checks: mobilityRoutineChecks(rule, routine) }));
            const categoryEligible = nationalTeamCategoryEligible(rule.pathway_name, profileLevel);
            const met = categoryEligible && !error && age != null && results.some(({ checks }) => checks.length > 0 && checks.every((check) => check.status === "met"));
            const failed = !categoryEligible || (!error && results.length > 0 && results.every(({ checks }) => checks.some((check) => check.status === "unmet")));
            const style = met ? "bg-emerald-50 text-emerald-950" : failed ? "bg-red-50 text-red-950" : "bg-amber-50 text-amber-950";
            return <details key={rule.id} className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
                <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${style}`}>
                    <span className="text-lg font-bold">{rule.pathway_name}</span>
                    <span className="mt-2 block text-sm font-semibold">{age == null ? "Date of birth required" : !categoryEligible ? "Competition category not eligible for this ranking list" : met ? "Profile DD target met · ranking entry requires verification" : failed ? "DD target not met" : "Checks incomplete"}</span>
                </summary>
                <div className="space-y-4 p-4">
                    <p className="text-sm font-semibold">Age requirement: {rule.max_age == null ? `${rule.min_age}+` : `${rule.min_age}–${rule.max_age}`}</p>
                    {rule.minimum_score != null && <p className="rounded-lg bg-zinc-50 p-3 text-sm"><strong>Score target: {Number(rule.minimum_score).toFixed(2)}</strong> (reference only · {rule.score_basis.replace(/_/g, " ")})</p>}
                    {!results.length && <p className="text-sm text-amber-900">Add a routine in Edit Routines to check DD.</p>}
                    {results.map(({ routine, checks }) => <div key={routine.name}><h3 className="mb-2 font-bold">{routine.name}</h3><ul className="space-y-2">{checks.map((check) => <li key={check.title} className={`rounded-xl border p-3 ${check.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : check.status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                        <p className="font-bold">{check.status === "met" ? "✓" : check.status === "unmet" ? "✕" : "!"} {check.title}</p><p className="mt-1 text-sm">{check.detail}</p>
                    </li>)}</ul></div>)}
                    <p className="text-sm leading-6 text-zinc-600">{nationalTeamEntryNote(rule.pathway_name, profileLevel)}</p>
                    <p className="text-sm leading-6 text-zinc-600">Coach verification required for trial participation, prior mobility, notifications, and eligible carried-forward scores. Saved routines indicate DD readiness; scores and ranking-list entry are not verified by this app.</p>
                    {discipline === "TRS" && <p className="text-sm text-zinc-600">This checks this athlete and the shared routine. Confirm the partner’s eligibility separately. Mixed SYN is not supported.</p>}
                </div>
            </details>;
        })}
    </section>;
}
