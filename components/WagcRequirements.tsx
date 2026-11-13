import { competitionAge } from "@/lib/competition-age";
import { mobilityRoutineChecks, type MobilityRoutine, type QualificationRequirement } from "@/lib/mobility";
import { WAGC_AGE_CUTOFF_YEAR, WAGC_RULESET_YEAR, supportsWagc, wagcAgeGroup, wagcCategoryEligible, wagcRules } from "@/lib/wagc";

export default function WagcRequirements({ requirements, dateOfBirth, gender, profileLevel, routines, error, routinesError }: {
    requirements: QualificationRequirement[];
    dateOfBirth: string | null;
    gender: string | null;
    profileLevel: string | null;
    routines: MobilityRoutine[];
    error?: string;
    routinesError?: string;
}) {
    if (!supportsWagc(profileLevel)) return null;
    const age = competitionAge(dateOfBirth, WAGC_AGE_CUTOFF_YEAR);
    const rule = wagcAgeGroup(requirements, dateOfBirth, gender);
    const categoryEligible = age != null && wagcCategoryEligible(profileLevel, age);
    const petition = age != null && age >= 11 && age <= 12;
    const availableRoutines = routines.filter((routine) => routine.value?.trim());
    const results = rule ? availableRoutines.map((routine) => ({ routine, checks: mobilityRoutineChecks(rule, routine) })) : [];
    const ddMet = !routinesError && results.some((result) => result.checks.every((check) => check.status === "met"));
    const ddFailed = !routinesError && results.length > 0 && results.every((result) => result.checks.some((check) => check.status === "unmet"));
    const issue = error ?? (age == null ? "Date of birth required to check WAGC age eligibility."
        : age < 11 ? "Underage athletes are not considered for this WAGC age cutoff."
        : age > 21 ? "The athlete is outside the WAGC age groups at this cutoff."
        : !wagcRules(requirements, gender).length ? "No matching 2026 WAGC TRI rules are visible for this gender category. Check the database entries and read permissions."
        : !rule ? "No matching WAGC age-group requirements found." : null);
    const status = issue ? (age != null && (age < 11 || age > 21) ? "unmet" : "unknown")
        : !categoryEligible || ddFailed ? "unmet" : petition || !ddMet ? "unknown" : "met";
    const summary = issue ?? (!categoryEligible ? "Competition category not eligible"
        : petition ? ddMet ? "Routine DD met · petition required" : "Petition required · check routine DD"
        : status === "met" ? "Profile requirements met"
        : status === "unmet" ? "Routine requirements not met" : "Checks incomplete");
    const style = status === "met" ? "bg-emerald-50 text-emerald-950" : status === "unmet" ? "bg-red-50 text-red-950" : "bg-amber-50 text-amber-950";

    return (
        <section aria-labelledby="wagc-heading" className="mt-7 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="wagc-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950">WAGC · TRI</h2>
            <p className="mt-2 text-sm text-zinc-600">{WAGC_RULESET_YEAR} rules · Age cutoff: December 31, {WAGC_AGE_CUTOFF_YEAR}</p>
            <details className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
                <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${style}`}>
                    <span className="text-lg font-bold">{rule ? `Ages ${rule.min_age}–${rule.max_age}` : "WAGC requirements"}</span>
                    <span className="mt-2 block text-sm font-semibold">{summary}</span>
                </summary>
                <div className="space-y-4 p-4">
                    {issue ? <p className="text-sm leading-6 text-zinc-700">{issue}</p> : rule && (
                        <>
                            <ul className="space-y-3">
                                <WagcCheck title={`Age: ${age} (as of December 31, ${WAGC_AGE_CUTOFF_YEAR})`} status="met" />
                                <WagcCheck title={`Competition category: ${profileLevel || "Not set"}`} status={categoryEligible ? "met" : "unmet"} detail="Eligible TRI categories: Novice (14U), Junior (13–16), Level 7 or Senior (17–21)." />
                                {petition && <WagcCheck title="Provincial petition required" status="unknown" detail="Ages 11–12 are considered case by case. The province must submit a petition for a TTPC decision." />}
                            </ul>
                            {rule.minimum_score != null && <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700"><span className="font-bold">Score target: {Number(rule.minimum_score).toFixed(2)}</span>{" "}({rule.score_basis === "best_compulsory_plus_optional" ? "Best compulsory plus best optional from preliminary rounds" : rule.score_basis === "single_voluntary" ? "One voluntary routine from preliminary or final" : rule.score_basis.replace(/_/g, " ")})</p>}
                            {rule.description && <p className="text-sm leading-6 text-zinc-600">{rule.description}</p>}
                            {routinesError ? <p className="text-sm text-amber-900">{routinesError}</p> : !results.length ? <p className="text-sm text-amber-900">Add an optional routine in Edit Routines to check DD.</p> : results.map(({ routine, checks }) => (
                                <div key={routine.name}>
                                    <h3 className="mb-2 font-bold text-zinc-950">{routine.name}</h3>
                                    <ul className="space-y-2">{checks.map((check) => <WagcCheck key={check.title} title={check.title} detail={check.detail} status={check.status} />)}</ul>
                                </div>
                            ))}
                        </>
                    )}
                    <div className="border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600">
                        <p className="font-bold text-zinc-800">{WAGC_RULESET_YEAR} selection rules (reference)</p>
                        <ul className="mt-2 list-disc space-y-2 pl-5">
                            <li>Selection events: 2026 Elite Canada and 2026 Canadian Championships.</li>
                            <li>Canadian Championships participation is required unless an absence is approved.</li>
                            <li>Scores come from the athlete’s regular competition category and are ranked within the same age group across categories.</li>
                            <li>Priority goes to eligible top-eight Senior National Team athletes not attending Worlds in the event, top-four Development athletes, and top-four Junior athletes, using rankings after the 2026 Senior Selection Camp.</li>
                            <li>For ages 17–21, Senior National Team athletes have priority, followed by Development National Team athletes. Ranking among National Team members follows the normal selection procedure.</li>
                            <li>At most four men and four women per individual age-group event may be selected.</li>
                        </ul>
                        <p className="mt-3">This checks the athlete’s profile and saved routines against the targets; it does not confirm team selection.</p>
                    </div>
                </div>
            </details>
        </section>
    );
}

function WagcCheck({ title, detail, status }: { title: string; detail?: string; status: "met" | "unmet" | "unknown" }) {
    const style = status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900";
    return <li className={`flex items-start gap-3 rounded-xl border p-3 ${style}`}>
        <span aria-hidden="true" className="font-bold">{status === "met" ? "✓" : status === "unmet" ? "✕" : "!"}</span>
        <div><p className="font-bold">{title}</p><span className="sr-only">{status === "met" ? "Requirement met. " : status === "unmet" ? "Requirement not met. " : "Verification needed. "}</span>{detail && <p className="mt-1 text-sm leading-6">{detail}</p>}</div>
    </li>;
}
