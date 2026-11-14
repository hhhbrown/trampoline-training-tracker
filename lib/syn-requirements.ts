import { assessDD, type LevelDDRequirement } from "./competition-dd";

export function synParticipationNote(level: string) {
    const numbered = /^level\s+(\d+)$/i.exec(level.trim());
    return level.trim().toLowerCase() === "senior" || (numbered != null && Number(numbered[1]) >= 5);
}

export function synDDCheck(difficulty: number | null | undefined, rule: LevelDDRequirement | undefined, levelName: string) {
    if (!rule) return { status: "unknown" as const, message: "No matching SYN DD requirements found.", range: null };
    const minimum = rule.min_dd == null ? null : Number(rule.min_dd);
    const maximum = rule.max_dd == null ? null : Number(rule.max_dd);
    const range = minimum != null && maximum != null ? `Level DD range: ${minimum.toFixed(2)}–${maximum.toFixed(2)}`
        : minimum != null ? `Minimum DD: ${minimum.toFixed(2)}`
        : maximum != null ? `Maximum DD: ${maximum.toFixed(2)}` : "No DD limits";
    if (difficulty == null || !Number.isFinite(difficulty) || difficulty < 0) return { status: "unknown" as const, message: "Add the synchro routine and DD in Edit Routines.", range };
    return { ...assessDD(difficulty, rule, levelName), range };
}
