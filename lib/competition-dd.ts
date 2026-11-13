export type LevelDDRequirement = {
    level_id: number | string;
    gender: string | null;
    min_dd: number | string | null;
    max_dd: number | string | null;
};

export function matchDDRequirement(requirements: LevelDDRequirement[], levelId: number | string | undefined, gender: string | null) {
    if (levelId == null) return undefined;
    const category = gender?.trim().toLowerCase();
    const competitionGender = category === "male" || category === "men" ? "men"
        : category === "female" || category === "woman" || category === "women" ? "women" : null;
    const candidates = requirements.filter((requirement) => String(requirement.level_id) === String(levelId));
    return candidates.find((requirement) => competitionGender != null && requirement.gender?.trim().toLowerCase() === competitionGender)
        ?? candidates.find((requirement) => requirement.gender == null);
}

export function assessDD(dd: number, requirement: LevelDDRequirement, levelName: string) {
    const actual = Math.round(dd * 100);
    const minimum = requirement.min_dd == null ? null : Math.round(Number(requirement.min_dd) * 100);
    const maximum = requirement.max_dd == null ? null : Math.round(Number(requirement.max_dd) * 100);
    if (minimum != null && actual < minimum) {
        const shortfall = (minimum - actual) / 100;
        const warningOnly = /^level\s+[1-4]$/i.test(levelName.trim());
        return {
            status: warningOnly ? "warning" as const : "penalty" as const,
            difference: shortfall,
            penalty: warningOnly ? 0 : shortfall,
            message: warningOnly
                ? `${shortfall.toFixed(2)} DD below minimum. Coach warning only; no penalty for Levels 1–4.`
                : `${shortfall.toFixed(2)} DD below minimum. Penalty: ${shortfall.toFixed(2)} points.`,
        };
    }
    if (maximum != null && actual > maximum) {
        const excess = (actual - maximum) / 100;
        return {
            status: "over" as const,
            difference: excess,
            penalty: 0,
            message: `${excess.toFixed(2)} DD above the level range. No penalty.`,
        };
    }
    return { status: "met" as const, difference: 0, penalty: 0, message: "Meets DD requirement" };
}
