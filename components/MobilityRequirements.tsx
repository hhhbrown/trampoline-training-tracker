import { dmtMobilityResults } from "@/lib/dmt-mobility";
import type { DmtSetDraft } from "@/lib/dmt-sets";
import type { DDLookupEntry } from "@/lib/dd";
import { matchCompetitionLevel, type CompetitionLevel } from "@/lib/competition-age";
import { ageAppropriateMobilityPaths, futureMobilitySeason, matchingMobilityPaths, mobilityCards, mobilityAgeCheck, mobilityGender, mobilityRoutineChecks, scoreBasisLabel, supportsMobility, type QualificationRequirement, type MobilityRoutine, type MobilityCheck } from "@/lib/mobility";

export default function MobilityRequirements({ profileLevel, dateOfBirth, gender, levels, year, requirements, routines, error, routinesError, discipline = "TRI", dmtSets = [], dmtDDLookup = [] }: {
    discipline?: "TRI" | "DMT";
    dmtSets?: DmtSetDraft[];
    dmtDDLookup?: DDLookupEntry[];
    profileLevel: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    levels: CompetitionLevel[];
    year: number;
    requirements: QualificationRequirement[];
    routines: MobilityRoutine[];
    error?: string;
    routinesError?: string;
}) {
    if (!supportsMobility(profileLevel ?? "")) return null;
    const source = matchCompetitionLevel(levels, profileLevel, discipline);
    const paths = source ? ageAppropriateMobilityPaths(matchingMobilityPaths(requirements, source, gender, year, discipline), source, levels, dateOfBirth, year) : [];
    const issue = error ?? (!source ? `Select a matching ${discipline} level in Edit Athlete to check mobility.`
        : !paths.length ? `No ${year} ${source.name.trim().toLowerCase() === "novice" ? "Novice to Junior" : discipline} mobility pathways are available for this level and gender category. Check that the rules are populated and readable by the app.` : null);
    const cards = mobilityCards(paths, source, levels, dateOfBirth, year);
    const availableRoutines = routines.filter((routine) => routine.value?.trim());

    return (
        <section aria-labelledby={`mobility-${discipline}-heading`} className="mt-7 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 id={`mobility-${discipline}-heading`} className="text-2xl font-extrabold tracking-tight text-zinc-950">{discipline} Mobility</h2>
            <p className="mt-2 text-sm text-zinc-600">{year - 1}/{year} season · {year} ruleset</p>
            {!mobilityGender(gender) && <p className="mt-3 text-sm text-amber-900">Gender is not set. Only pathways that apply to all genders can be checked.</p>}
            {issue ? <p role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{issue}</p> : (
                <div className="mt-5 space-y-4">
                    {cards.map(({ path, title, destinationNote }) => {
                        const target = levels.find((level) => String(level.id) === String(path.target_level_id) && level.discipline === discipline);
                        const futureSeason = source && (/^level\s+4$/i.test(source.name.trim()) || ["novice", "junior"].includes(source.name.trim().toLowerCase()))
                            ? futureMobilitySeason(path, target, dateOfBirth, year, discipline) : null;
                        const ageCheck = mobilityAgeCheck(path, target, dateOfBirth, year, discipline);
                        const needsRoutine = path.minimum_dd != null || Boolean(path.required_skill);
                        const routineResults = discipline === "DMT" ? dmtMobilityResults(path, dmtSets, dmtDDLookup) : availableRoutines.map((routine) => ({ routine, checks: mobilityRoutineChecks(path, routine) }));
                        const ddMet = path.minimum_dd == null || (!routinesError && routineResults.some(({ routine }) =>
                            routine.difficulty != null && Number.isFinite(routine.difficulty) && routine.difficulty >= Number(path.minimum_dd)));
                        if (futureSeason) {
                            ageCheck.status = "unknown";
                            if (ddMet) ageCheck.detail = `Age-eligible for ${target?.name} from the ${futureSeason.label} season (December 31, ${futureSeason.endYear}).`;
                        }
                        const routineMet = !needsRoutine || (!routinesError && routineResults.some((result) => result.checks.every((check) => check.status === "met")));
                        const routineFailed = needsRoutine && !routinesError && routineResults.length > 0 && routineResults.every((result) => result.checks.some((check) => check.status === "unmet"));
                        const status = ageCheck.status === "unmet" || routineFailed ? "unmet"
                            : ageCheck.status === "unknown" || !routineMet ? "unknown" : "met";
                        const summary = status === "unmet" ? "Requirements not met"
                            : status === "met" ? "Profile requirements met"
                            : futureSeason && routineMet ? null : "Checks incomplete";
                        return (
                            <details key={path.id} className="overflow-hidden rounded-xl border border-zinc-200">
                                <summary className={`cursor-pointer px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-700 ${status === "met" ? "bg-emerald-50" : futureSeason && status !== "unmet" ? "bg-amber-50" : "bg-red-50"}`}>
                                    <span className="text-lg font-bold text-black">{title || `${source?.name} to ${target?.name ?? "target level"}`}</span>
                                    {destinationNote && <span className="mt-2 block text-sm font-medium text-zinc-700">{destinationNote}</span>}
                                    {futureSeason && ddMet && <span className="mt-2 block text-sm font-medium text-amber-900">Age-eligible for {target?.name} from {futureSeason.label}; the score target can still be pursued now.</span>}
                                    {summary && <span className={`mt-2 block text-sm font-semibold ${status === "met" ? "text-emerald-800" : status === "unmet" ? "text-red-800" : "text-amber-900"}`}>{summary}</span>}
                                </summary>
                                <div className="space-y-4 p-4">
                                    {discipline === "DMT" && <p className="text-sm text-black">Saved passes indicate DD and skill readiness. The score is a reference target, not a verified competition result.</p>}
                                    {path.description && <p className="text-sm leading-6 text-zinc-600">{path.description}</p>}
                                    {path.minimum_score != null && (
                                        <p className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
                                            <span className="font-bold">Score target: {Number(path.minimum_score).toFixed(2)}</span>{" "}
                                            ({scoreBasisLabel(path.score_basis)})
                                        </p>
                                    )}
                                    <ul className="space-y-3">
                                        <CheckRow check={ageCheck} />
                                    </ul>
                                    {needsRoutine && (
                                        <div className="space-y-4">
                                            <p className="text-sm font-medium text-zinc-600">DD and skill requirements must be met in the same {discipline === "DMT" ? "two-pass round" : "routine"}.</p>
                                            {routinesError ? <p className="text-sm text-amber-900">{routinesError}</p> : !routineResults.length ? <p className="text-sm text-amber-900">Add {discipline === "DMT" ? "DMT passes" : "an optional routine"} in Edit Routines to check DD and skills.</p> : routineResults.map(({ routine, checks }) => (
                                                <div key={routine.name}>
                                                    <h3 className="mb-2 font-bold text-zinc-950">{routine.name}</h3>
                                                    <ul className="space-y-2">{checks.map((check) => <CheckRow key={check.title} check={check} />)}</ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </details>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function CheckRow({ check }: { check: MobilityCheck }) {
    const style = check.status === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : check.status === "unmet" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900";
    return (
        <li className={`flex items-start gap-3 rounded-xl border p-3 ${style}`}>
            <span aria-hidden="true" className="font-bold">{check.status === "met" ? "✓" : check.status === "unmet" ? "✕" : "!"}</span>
            <div>
                <p className="font-bold">{check.title}</p>
                <span className="sr-only">{check.status === "met" ? "Requirement met. " : check.status === "unmet" ? "Requirement not met. " : "Verification needed. "}</span>
                {check.detail && <p className="mt-1 text-sm leading-6">{check.detail}</p>}
            </div>
        </li>
    );
}
