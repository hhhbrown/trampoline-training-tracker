import { competitionAge } from "./competition-age";
import { mobilityGender, type QualificationRequirement } from "./mobility";

export const NATIONAL_TEAM_RULESET_YEAR = 2026;

export function supportsNationalTeam(level: string | null, discipline: "TRI" | "TRS" | "DMT" = "TRI") {
    return (discipline === "DMT" ? /^(junior|level\s+6|senior)$/i : /^(junior|level\s+7|senior)$/i).test(level?.trim() ?? "");
}

export function nationalTeamRules(requirements: QualificationRequirement[], discipline: "TRI" | "TRS" | "DMT", gender: string | null, birthDate: string | null, year: number) {
    const age = competitionAge(birthDate, year);
    return requirements.filter((rule) => rule.qualification_type === "international"
        && rule.ruleset_year === NATIONAL_TEAM_RULESET_YEAR && rule.discipline === discipline
        && /^National Team\s*-/i.test(rule.pathway_name ?? "")
        && (rule.gender == null || mobilityGender(rule.gender) === mobilityGender(gender))
        && (age == null || ((rule.min_age == null || age >= rule.min_age) && (rule.max_age == null || age <= rule.max_age))));
}

export function nationalTeamEntryNote(pathway: string | null, level: string | null) {
    if (/development/i.test(pathway ?? "")) return "Entry follows competing Senior or Level 7 at a domestic National Team Trial, or aging out of Junior on January 1. Junior scores from the previous domestic trials and identified international events may carry forward within 12 months.";
    if (/junior/i.test(pathway ?? "")) return "Entry follows competing Junior at a domestic National Team Trial. Novice scores from the previous domestic trials and identified international events may carry forward within 12 months.";
    return `${level?.trim().toLowerCase() === "senior" ? "Entry follows" : "Senior entry requires"} competing Senior at a domestic National Team Trial, or aging out of Junior on January 1 with prior Senior mobility and coach notification to the PTO and GymCan. Level 7 and Junior scores from previous domestic trials and identified international events may carry forward within 12 months.`;
}

export function nationalTeamCategoryEligible(pathway: string | null, level: string | null) {
    const name = level?.trim().toLowerCase() ?? "";
    if (/junior/i.test(pathway ?? "")) return name === "junior";
    // Aged-out Juniors can enter Development or Senior through the stated January 1 pathways.
    return ["junior", "level 7", "senior"].includes(name);
}
