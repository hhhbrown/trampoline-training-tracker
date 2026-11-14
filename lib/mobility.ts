import { competitionAge, meetsAgeRequirements, type CompetitionLevel } from "./competition-age";

export type QualificationRequirement = {
    discipline?: string | null;
    id: number | string;
    qualification_type: string;
    source_level_id: number | string | null;
    target_level_id: number | string | null;
    gender: string | null;
    min_age: number | null;
    max_age: number | null;
    minimum_score: number | string | null;
    minimum_dd: number | string | null;
    score_basis: string;
    pathway_name: string | null;
    description: string | null;
    required_skill: string | null;
    ruleset_year: number;
};

export type MobilityRoutine = { name: string; value: string | null; difficulty: number | null };
export type MobilityCheck = { title: string; status: "met" | "unmet" | "unknown"; detail?: string };

export function supportsMobility(levelName: string) {
    if (["novice", "junior", "senior"].includes(levelName.trim().toLowerCase())) return true;
    const numbered = /^level\s+(\d+)$/i.exec(levelName.trim());
    return numbered != null && Number(numbered[1]) >= 4;
}

export function mobilityGender(gender: string | null) {
    const normalized = gender?.trim().toLowerCase();
    if (["male", "men"].includes(normalized ?? "")) return "men";
    if (["female", "woman", "women"].includes(normalized ?? "")) return "women";
    return normalized || null;
}

export function matchingMobilityPaths(requirements: QualificationRequirement[], source: CompetitionLevel, gender: string | null, year: number) {
    return requirements.filter((requirement) => requirement.qualification_type === "mobility"
        && requirement.ruleset_year === year
        && source.discipline === "TRI"
        && source.id != null && String(requirement.source_level_id) === String(source.id)
        && (requirement.gender == null || mobilityGender(requirement.gender) === mobilityGender(gender)));
}

export function mobilityAgeCheck(rule: QualificationRequirement, target: CompetitionLevel | undefined, birthDate: string | null, year: number): MobilityCheck {
    const age = competitionAge(birthDate, year);
    const title = `Age: ${age ?? "Not available"}`;
    if (age == null) return { title, status: "unknown", detail: "Date of birth required to check age eligibility." };
    if (!target || target.discipline !== "TRI") return { title, status: "unknown", detail: "Target TRI level could not be found." };
    const minimum = Math.max(rule.min_age ?? 0, target.min_age ?? 0);
    const maximum = Math.min(rule.max_age ?? Infinity, target.max_age ?? Infinity);
    const met = meetsAgeRequirements(age, { name: target.name, discipline: "TRI", min_age: minimum, max_age: maximum === Infinity ? null : maximum });
    return { title, status: met ? "met" : "unmet", detail: `${maximum === Infinity ? `Required: ${minimum}+ years` : `Required: ${minimum}–${maximum} years`} (December 31, ${year})` };
}

export function mobilityRoutineChecks(rule: QualificationRequirement, routine: MobilityRoutine): MobilityCheck[] {
    const checks: MobilityCheck[] = [];
    if (rule.minimum_dd != null) {
        const minimum = Number(rule.minimum_dd);
        const dd = routine.difficulty;
        const valid = dd != null && Number.isFinite(dd) && dd >= 0;
        checks.push({
            title: `DD: ${valid ? dd.toFixed(2) : "Not set"}`,
            status: !valid ? "unknown" : dd >= minimum ? "met" : "unmet",
            detail: `Minimum DD: ${minimum.toFixed(2)}`,
        });
    }
    if (rule.required_skill) {
        if (rule.required_skill === "double_salto") {
            const hasDouble = (routine.value ?? "").split(/[,\r\n]+/).some((code) => /^8/.test(code.trim().replace(/^\.+/, "")));
            checks.push({ title: "Double salto", status: !routine.value?.trim() ? "unknown" : hasDouble ? "met" : "unmet", detail: hasDouble ? "Present in this routine" : "Required in this routine" });
        } else {
            checks.push({ title: `Required skill: ${rule.required_skill}`, status: "unknown", detail: "Coach verification required" });
        }
    }
    return checks;
}

export function scoreBasisLabel(basis: string) {
    const labels: Record<string, string> = {
        compulsory_plus_optional: "Compulsory + optional from the same competition",
        prelim_including_bonus: "Preliminary score including bonus",
        prelim: "Preliminary score",
        second_voluntary_or_final: "Second voluntary or final routine",
        any_routine: "Any routine",
        age_based: "Age-based mobility",
    };
    return labels[basis] ?? basis.replace(/_/g, " ");
}

export function ageAppropriateMobilityPaths(paths: QualificationRequirement[], source: CompetitionLevel, levels: CompetitionLevel[], birthDate: string | null, year: number) {
    const age = competitionAge(birthDate, year);
    if (source.name.trim().toLowerCase() === "junior") {
        return paths.filter((path) => levels.some((target) => String(target.id) === String(path.target_level_id)
            && target.discipline === "TRI" && ["level 7", "senior"].includes(target.name.trim().toLowerCase())));
    }
    if (source.name.trim().toLowerCase() === "novice") {
        return paths.filter((path) => levels.some((target) => String(target.id) === String(path.target_level_id)
            && target.discipline === "TRI" && target.name.trim().toLowerCase() === "junior"));
    }
    if (!/^level\s+4$/i.test(source.name.trim()) || age == null) return paths;
    return paths.filter((path) => {
        const target = levels.find((level) => String(level.id) === String(path.target_level_id) && level.discipline === "TRI");
        if (target?.name.trim().toLowerCase() === "novice") return age <= (target.max_age ?? path.max_age ?? Infinity);
        if (target?.name.trim().toLowerCase() === "level 5") return age >= (target.min_age ?? path.min_age ?? 0);
        return true;
    });
}

export function futureMobilitySeason(rule: QualificationRequirement, target: CompetitionLevel | undefined, birthDate: string | null, year: number) {
    const age = competitionAge(birthDate, year);
    if (age == null || !target || target.discipline !== "TRI") return null;
    const minimum = Math.max(rule.min_age ?? 0, target.min_age ?? 0);
    const maximum = Math.min(rule.max_age ?? Infinity, target.max_age ?? Infinity);
    if (age >= minimum || minimum > maximum) return null;
    const endYear = year + minimum - age;
    return { endYear, label: `${endYear - 1}/${endYear}` };
}

export function mobilityCards(paths: QualificationRequirement[], source: CompetitionLevel | undefined, levels: CompetitionLevel[], birthDate: string | null, year: number) {
    const cards = paths.map((path) => ({ path, title: path.pathway_name, destinationNote: null as string | null }));
    if (!source || !/^level\s+5$/i.test(source.name.trim())) return cards;
    const targetFor = (path: QualificationRequirement) => levels.find((level) => String(level.id) === String(path.target_level_id) && level.discipline === "TRI");
    const junior = paths.find((path) => targetFor(path)?.name.trim().toLowerCase() === "junior");
    const level6 = paths.find((path) => targetFor(path)?.name.trim().toLowerCase() === "level 6");
    if (!junior || !level6) return cards;
    const sameNumber = (a: number | string | null, b: number | string | null) => a == null || b == null ? a === b : Number(a) === Number(b);
    if (!sameNumber(junior.minimum_dd, level6.minimum_dd) || !sameNumber(junior.minimum_score, level6.minimum_score)
        || junior.score_basis !== level6.score_basis || junior.required_skill !== level6.required_skill) return cards;
    const eligible = [junior, level6].find((path) => mobilityAgeCheck(path, targetFor(path), birthDate, year).status === "met");
    const selected = eligible ?? junior;
    const age = competitionAge(birthDate, year);
    const destinationNote = eligible ? `Destination: ${targetFor(selected)?.name} (based on season age ${age})`
        : age == null ? "Date of birth required to determine Junior or Level 6 placement."
        : "Junior or Level 6 placement depends on meeting the destination’s age requirements.";
    return cards.flatMap((card) => card.path.id === junior.id
        ? [{ path: selected, title: "Level 5 to Junior / Level 6", destinationNote }]
        : card.path.id === level6.id ? [] : [card]);
}
