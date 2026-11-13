import CompulsoryRequirements from "./CompulsoryRequirements";
import { requiresAdvancedCompulsory } from "@/lib/competition-compulsory";
import { matchDDRequirement, assessDD, type LevelDDRequirement } from "@/lib/competition-dd";
import { competitionAge, matchCompetitionLevel, meetsAgeRequirements, type CompetitionLevel } from "@/lib/competition-age";

export default function CompetitionRequirements({ dateOfBirth, profileLevel, gender, levels, year, lookupError, ddRequirements, routines, ddLookupError, routinesError }: {
    dateOfBirth: string | null;
    profileLevel: string | null;
    gender: string | null;
    levels: CompetitionLevel[];
    year: number;
    lookupError?: string;
    ddRequirements: LevelDDRequirement[];
    routines: {
        compulsory: string | null;
        custom_compulsory: string | null;
        optional_a: string | null;
        optional_a_difficulty: number | null;
        optional_b: string | null;
        optional_b_difficulty: number | null;
    } | null;
    ddLookupError?: string;
    routinesError?: string;
}) {
    const age = competitionAge(dateOfBirth, year);
    const level = matchCompetitionLevel(levels, profileLevel, "TRI");
    const genderCategory = gender?.trim().toLowerCase() === "male" ? "Men"
        : gender?.trim().toLowerCase() === "female" ? "Women"
        : gender?.trim() || "Gender not set";
    const levelName = level?.name ?? profileLevel?.trim() ?? "";
    const issue = !dateOfBirth ? "Date of birth required"
        : age == null ? "Check date of birth"
        : lookupError ? "Age requirements unavailable"
        : !levelName ? "TRI level required"
        : !level ? "No matching age requirements for this TRI level"
        : null;
    const eligible = !issue && age != null && level != null ? meetsAgeRequirements(age, level) : null;
    const statusStyle = eligible === true ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : eligible === false ? "border-red-200 bg-red-50 text-red-900"
        : "border-amber-200 bg-amber-50 text-amber-900";

    const ddRequirement = matchDDRequirement(ddRequirements, level?.id, gender);
    const optionalRoutines = [
        { name: "Optional A", value: routines?.optional_a, difficulty: routines?.optional_a_difficulty },
        { name: "Optional B", value: routines?.optional_b, difficulty: routines?.optional_b_difficulty },
    ].filter((routine) => routine.value?.trim());
    const ddIssue = lookupError ? "Competition level requirements unavailable"
        : !level ? "No matching TRI level"
        : ddLookupError ?? routinesError ?? (!ddRequirement ? "No DD requirements found for this level and gender category" : null);
    const ddRange = ddRequirement
        ? ddRequirement.min_dd != null && ddRequirement.max_dd != null ? `Level DD range: ${Number(ddRequirement.min_dd).toFixed(2)}–${Number(ddRequirement.max_dd).toFixed(2)}`
            : ddRequirement.min_dd != null ? `Required DD: ${Number(ddRequirement.min_dd).toFixed(2)}+`
            : ddRequirement.max_dd != null ? `Level DD range: up to ${Number(ddRequirement.max_dd).toFixed(2)}`
            : "No DD limits"
        : undefined;

    return (
        <section aria-labelledby="competition-category-heading" className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 px-5 py-5 sm:px-6">
                <h2 id="competition-category-heading" className="break-words text-2xl font-extrabold tracking-tight text-red-950">TRI {levelName || "Level not set"} · {genderCategory}</h2>
                <p className="mt-2 text-sm font-medium text-zinc-600">{year - 1}/{year} competition requirements</p>
            </div>
            <div className="p-5 sm:p-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-600">Requirements</h3>
                <ul className="space-y-3">
                    <li className={`flex items-start gap-3 rounded-xl border p-4 ${statusStyle}`}>
                        <span aria-hidden="true" className="mt-0.5 text-xl font-bold">{eligible === true ? "✓" : eligible === false ? "✕" : "!"}</span>
                        <div>
                            <span className="sr-only">{eligible ? "Meets age requirement" : eligible === false ? "Does not meet age requirement" : "Age could not be checked"}. </span>
                            <p><span className="text-lg font-bold">Age: {age ?? "Not available"}</span>{" "}<span className="text-sm font-medium">(as of December 31, {year})</span></p>
                            {issue && <p className="mt-1 text-sm font-semibold">{issue}</p>}
                        </div>
                    </li>
                    {optionalRoutines.length ? optionalRoutines.map((routine) => {
                        const dd = routine.difficulty;
                        const missingDD = dd == null || !Number.isFinite(dd) || dd < 0;
                        const assessment = !ddIssue && !missingDD && ddRequirement && level ? assessDD(dd, ddRequirement, level.name) : null;
                        const ddStatus = !assessment || assessment.status === "over" ? null : assessment.status === "met";
                        return <DDRequirementRow
                            key={routine.name}
                            title={`${routine.name} DD: ${missingDD ? "Not set" : dd.toFixed(2)}`}
                            eligible={ddStatus}
                            message={ddIssue ?? (missingDD ? "Save a DD for this routine in Edit Routines" : assessment?.message ?? "DD could not be checked")}
                            range={ddRange}
                            bonus={!missingDD && !ddIssue && ddRequirement && level?.discipline === "TRI" && /^level\s+[1-4]$/i.test(level.name.trim())
                                ? Math.min(dd, ddRequirement.max_dd == null ? dd : Number(ddRequirement.max_dd))
                                : undefined}
                        />;
                    }) : <DDRequirementRow title="Routine DD" eligible={null} message={ddIssue ?? "Add an optional routine in Edit Routines to check DD requirements"} range={ddRange} />}
                </ul>
                {requiresAdvancedCompulsory(levelName) && (
                    <CompulsoryRequirements compulsory={routines?.compulsory} routine={routines?.custom_compulsory} error={routinesError} />
                )}
            </div>
        </section>
    );
}

function DDRequirementRow({ title, eligible, message, range, bonus }: {
    title: string;
    eligible: boolean | null;
    message: string;
    range?: string;
    bonus?: number;
}) {
    const style = eligible === true ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : eligible === false ? "border-red-200 bg-red-50 text-red-900"
        : "border-amber-200 bg-amber-50 text-amber-900";
    return (
        <li className={`flex items-start gap-3 rounded-xl border p-4 ${style}`}>
            <span aria-hidden="true" className="mt-0.5 text-xl font-bold">{eligible === true ? "✓" : eligible === false ? "✕" : "!"}</span>
            <div>
                <p><span className="text-lg font-bold">{title}</span>{range && <> <span className="text-sm font-medium">({range})</span></>}</p>
                <p className="mt-1 text-sm font-semibold">{message}</p>
                {bonus != null && <p className="mt-2 text-sm font-bold">Bonus: +{bonus.toFixed(2)} points</p>}
            </div>
        </li>
    );
}
