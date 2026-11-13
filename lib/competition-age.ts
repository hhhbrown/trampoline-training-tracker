export type CompetitionLevel = {
    name: string;
    discipline: string;
    min_age: number | null;
    max_age: number | null;
};

export function competitionSeason(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver", year: "numeric", month: "numeric",
    }).formatToParts(now);
    const year = Number(parts.find((part) => part.type === "year")?.value);
    const month = Number(parts.find((part) => part.type === "month")?.value);
    // Keep the previous season through summer; the next starts in September.
    const endYear = month >= 9 ? year + 1 : year;
    return { endYear, label: `${endYear - 1}/${endYear}` };
}

export function competitionAge(dateOfBirth: string | null, year: number): number | null {
    if (!dateOfBirth || !Number.isInteger(year) || year < 1900 || year > 9999) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
    if (!match) return null;
    const [, y, m, d] = match.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d || y > year) return null;
    return year - y;
}

export function matchCompetitionLevel(levels: CompetitionLevel[], profileLevel: string | null, discipline: string) {
    const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
    const name = normalize(profileLevel ?? "");
    if (!name) return undefined;
    const candidates = levels.filter((level) => level.discipline === discipline);
    return candidates.find((level) => normalize(level.name) === name)
        ?? candidates.find((level) => level.name.split("/").some((alias) => normalize(alias) === name));
}

export function meetsAgeRequirements(age: number, level: CompetitionLevel) {
    return (level.min_age == null || age >= level.min_age) && (level.max_age == null || age <= level.max_age);
}
