import { competitionAge, matchCompetitionLevel, meetsAgeRequirements, type CompetitionLevel } from "@/lib/competition-age";

export default function CompetitionAgeCheck({ dateOfBirth, profileLevel, gender, levels, year, lookupError }: {
    dateOfBirth: string | null;
    profileLevel: string | null;
    gender: string | null;
    levels: CompetitionLevel[];
    year: number;
    lookupError?: string;
}) {
    const age = competitionAge(dateOfBirth, year);
    const level = matchCompetitionLevel(levels, profileLevel, "TRI");
    const genderCategory = gender?.trim().toLowerCase() === "male" ? "Men"
        : gender?.trim().toLowerCase() === "female" ? "Woman"
        : gender?.trim() || "Gender not set";
    const levelName = level?.name ?? profileLevel?.trim() ?? "";
    const issue = !dateOfBirth ? "Date of birth required"
        : age == null ? "Check date of birth"
        : lookupError ? "Age requirements unavailable"
        : !levelName ? "TRI level required"
        : !level ? "No matching age requirements for this TRI level"
        : null;
    const eligible = !issue && age != null && level != null ? meetsAgeRequirements(age, level) : null;
    const requirement = level
        ? level.min_age != null && level.max_age != null ? `Required: ${level.min_age}–${level.max_age} years`
            : level.min_age != null ? `Required: ${level.min_age}+ years`
            : level.max_age != null ? `Required: ${level.max_age} years or younger`
            : "No age limits"
        : null;
    const statusStyle = eligible === true ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : eligible === false ? "border-red-200 bg-red-50 text-red-900"
        : "border-amber-200 bg-amber-50 text-amber-900";

    return (
        <section aria-labelledby="competition-category-heading" className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 px-5 py-5 sm:px-6">
                <h2 id="competition-category-heading" className="break-words text-2xl font-extrabold tracking-tight text-red-950">TRI {levelName || "Level not set"} · {genderCategory}</h2>
                <p className="mt-2 text-sm font-medium text-zinc-600">{year - 1}/{year} competition requirements</p>
            </div>
            <div className="p-5 sm:p-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-600">Requirements</h3>
                <ul>
                    <li className={`flex items-start gap-3 rounded-xl border p-4 ${statusStyle}`}>
                        <span aria-hidden="true" className="mt-0.5 text-xl font-bold">{eligible === true ? "✓" : eligible === false ? "✕" : "!"}</span>
                        <div>
                            <p className="text-lg font-bold">Age: {age ?? "Not available"}</p>
                            <p className="mt-1 text-sm font-semibold">{issue ?? (eligible ? "Meets age requirement" : "Does not meet age requirement")}</p>
                            {requirement && <p className="mt-1 text-sm">{requirement}</p>}
                            <p className="mt-1 text-xs">As of December 31, {year}</p>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
    );
}
