import { matchCompetitionLevel, type CompetitionLevel } from "@/lib/competition-age";
import { mobilityRoutineChecks, scoreBasisLabel, type MobilityRoutine, type QualificationRequirement } from "@/lib/mobility";
import { nationalsLevelExempt, nationalsRequirement } from "@/lib/nationals";

export default function NationalsRequirements({ profileLevel, gender, levels, year, requirements, routines, error, routinesError, discipline = "TRI" }: {
    discipline?: "TRI" | "DMT";
    profileLevel: string | null;
    gender: string | null;
    levels: CompetitionLevel[];
    year: number;
    requirements: QualificationRequirement[];
    routines: MobilityRoutine[];
    error?: string;
    routinesError?: string;
}) {
    const exempt = nationalsLevelExempt(profileLevel);
    const level = matchCompetitionLevel(levels, profileLevel, discipline);
    const rule = nationalsRequirement(requirements, level, gender, year);
    const issue = error ?? (!level ? `Select a matching ${discipline} level in Edit Athlete to check the qualification standard.`
        : !rule ? `No ${year} Canadian Championships standard is visible for this ${discipline} level and gender category. Check the rules and read permissions.` : null);
    const results = rule ? routines.filter((routine) => routine.value?.trim()).map((routine) => ({ routine, checks: mobilityRoutineChecks(rule, routine) })) : [];
    const needsRoutine = rule != null && (rule.minimum_dd != null || Boolean(rule.required_skill));
    const met = !needsRoutine || (!routinesError && results.some((result) => result.checks.every((check) => check.status === "met")));
    const failed = !routinesError && results.length > 0 && results.every((result) => result.checks.some((check) => check.status === "unmet"));
    const status = exempt ? "met" : issue ? "unknown" : failed ? "unmet" : met ? "met" : "unknown";
    const summary = exempt ? "No qualification required · High-performance level"
        : issue ? "Qualification standard unavailable"
        : status === "met" ? "Profile requirements met"
        : status === "unmet" ? "Routine requirements not met" : "Checks incomplete";
    const style = status === "met" ? "bg-emerald-50 text-emerald-950" : status === "unmet" ? "bg-red-50 text-red-950" : "bg-amber-50 text-amber-950";

    return (
        <section aria-labelledby={`nationals-${discipline}-heading`} className="mt-7 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 id={`nationals-${discipline}-heading`} className="text-2xl font-extrabold tracking-tight text-zinc-950">Canadian Championships · {discipline}</h2>
            <p className="mt-2 text-sm text-zinc-600">{year - 1}/{year} season · {year} ruleset</p>
            <details className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
                <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${style}`}>
                    <span className="text-lg font-bold">{profileLevel || "Qualification standards"}</span>
                    <span className="mt-2 block text-sm font-semibold">{summary}</span>
                </summary>
                <div className="space-y-4 p-4">
                    {exempt ? (
                        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">✓ Novice, Junior, and Senior athletes do not need to qualify for Canadian Championships.</p>
                    ) : issue ? <p role="status" className="text-sm leading-6 text-amber-900">{issue}</p> : rule && (
                        <>
                            {rule.minimum_score != null && <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700"><span className="font-bold">Score target: {Number(rule.minimum_score).toFixed(2)}</span>{" "}({scoreBasisLabel(rule.score_basis)})</p>}
                            {rule.description && <p className="text-sm leading-6 text-zinc-600">{rule.description}</p>}
                            {needsRoutine && (routinesError ? <p className="text-sm text-amber-900">{routinesError}</p> : !results.length ? <p className="text-sm text-amber-900">Add {discipline === "DMT" ? "two complete DMT passes" : "an optional routine"} in Edit Routines to check the DD standard.</p> : results.map(({ routine, checks }) => (
                                <div key={routine.name}>
                                    <h3 className="mb-2 font-bold text-zinc-950">{routine.name}</h3>
                                    <ul className="space-y-2">{checks.map((check) => (
                                        <li key={check.title} className={`rounded-xl border p-3 ${check.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : check.status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                                            <p className="font-bold"><span aria-hidden="true">{check.status === "met" ? "✓" : check.status === "unmet" ? "✕" : "!"}</span>{" "}{check.title}</p>
                                            <span className="sr-only">{check.status === "met" ? "Requirement met. " : check.status === "unmet" ? "Requirement not met. " : "Verification needed. "}</span>
                                            {check.detail && <p className="mt-1 text-sm">{check.detail}</p>}
                                        </li>
                                    ))}</ul>
                                </div>
                            )))}
                            <p className="text-sm leading-6 text-zinc-600">Profile readiness is based on saved routines. The score target is shown for planning; this does not confirm a qualifying competition result.</p>
                        </>
                    )}
                    <div className="border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600">
                        <p className="font-bold text-zinc-800">Team exemption</p>
                        <p className="mt-1">Athletes on the current National Team, 2026 World Championship Team, or 2026 World Age Group Championships Team automatically qualify for Canadian Championships in that event.</p>
                        <p className="mt-2">Coach verification required: team membership for {discipline} is not recorded in the athlete profile.</p>
                    </div>
                </div>
            </details>
        </section>
    );
}
