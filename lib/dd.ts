export type DDLookupEntry = { fig_code: string; difficulty: number | string };

export function calculateDD(routine: string, lookup: DDLookupEntry[]) {
    const skills = routine.split(/[,\r\n]+/).map((skill) => skill.trim()).filter(Boolean);
    const normalize = (code: string) => code.replace(/^\.+/, "");
    const difficulties = new Map(lookup.map((entry) => [normalize(entry.fig_code), Math.round(Number(entry.difficulty) * 100)]));
    const seen = new Set<string>();
    const repeated = new Set<string>();
    const unmatched = new Set<string>();
    let hundredths = 0;
    for (const skill of skills) {
        if (seen.has(skill)) repeated.add(skill);
        seen.add(skill);
        const difficulty = difficulties.get(normalize(skill));
        if (difficulty == null || !Number.isFinite(difficulty)) unmatched.add(skill);
        else hundredths += difficulty;
    }
    return {
        total: skills.length ? hundredths / 100 : null,
        unmatched: [...unmatched],
        repeated: [...repeated],
    };
}
