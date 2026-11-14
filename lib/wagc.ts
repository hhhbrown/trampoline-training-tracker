import { competitionAge } from "./competition-age";
import { mobilityGender, type QualificationRequirement } from "./mobility";

export const WAGC_RULESET_YEAR = 2026;
// Use the published 2026 criteria for the upcoming trials until new rules arrive.
export const WAGC_AGE_CUTOFF_YEAR = 2027;

export function supportsWagc(profileLevel: string | null) {
    const name = profileLevel?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
    // Novice is the split Level 5-equivalent category named in the WAGC rules.
    if (["novice", "junior", "senior"].includes(name)) return true;
    const numbered = /^level\s+(\d+)$/.exec(name);
    return numbered != null && Number(numbered[1]) >= 5;
}

export function wagcRules(requirements: QualificationRequirement[], gender: string | null, discipline: "TRI" | "DMT" = "TRI") {
    return requirements.filter((rule) => rule.qualification_type === "international"
        && rule.ruleset_year === WAGC_RULESET_YEAR
        && /\bWAGC\b/i.test(rule.pathway_name ?? "")
        && (rule.discipline != null ? rule.discipline === discipline : discipline === "TRI" && /\bTRI\b/i.test(rule.pathway_name ?? ""))
        && (rule.gender == null || mobilityGender(rule.gender) === mobilityGender(gender)));
}

export function wagcAgeGroup(requirements: QualificationRequirement[], birthDate: string | null, gender: string | null, discipline: "TRI" | "DMT" = "TRI") {
    const age = competitionAge(birthDate, WAGC_AGE_CUTOFF_YEAR);
    if (age == null) return undefined;
    return wagcRules(requirements, gender, discipline).find((rule) => (rule.min_age == null || age >= rule.min_age)
        && (rule.max_age == null || age <= rule.max_age));
}

export function wagcCategoryEligible(profileLevel: string | null, age: number) {
    const name = profileLevel?.trim().toLowerCase().replace(/\s+/g, " ");
    return (name === "novice" && age >= 11 && age <= 14)
        || (name === "junior" && age >= 13 && age <= 16)
        || (["level 7", "senior"].includes(name ?? "") && age >= 17 && age <= 21);
}
