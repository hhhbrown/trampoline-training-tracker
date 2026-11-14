import type { CompetitionLevel } from "./competition-age";
import { mobilityGender, type QualificationRequirement } from "./mobility";

export function nationalsLevelExempt(profileLevel: string | null) {
    return ["novice", "junior", "senior"].includes(profileLevel?.trim().toLowerCase() ?? "");
}

export function nationalsRequirement(requirements: QualificationRequirement[], level: CompetitionLevel | undefined, gender: string | null, year: number) {
    if (level?.id == null || !["TRI", "DMT"].includes(level.discipline)) return undefined;
    const matching = requirements.filter((rule) => rule.qualification_type === "nationals"
        && rule.ruleset_year === year
        && (rule.discipline == null || rule.discipline === level.discipline)
        && String(rule.target_level_id) === String(level.id));
    return matching.find((rule) => rule.gender != null && mobilityGender(rule.gender) === mobilityGender(gender))
        ?? matching.find((rule) => rule.gender == null);
}
