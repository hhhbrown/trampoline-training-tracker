import { calculateDmtDD } from "./dmt-dd";
import type { DDLookupEntry } from "./dd";
import type { DmtSetDraft } from "./dmt-sets";
import type { MobilityRoutine } from "./mobility";

export function dmtNationalsRounds(sets: DmtSetDraft[], lookup: DDLookupEntry[]): MobilityRoutine[] {
    return sets.flatMap((set, index) => [[1, 2], [3, 4]].flatMap((numbers, round) => {
        const passes = numbers.map((number) => set.passes.find((pass) => pass.passNumber === number));
        if (passes.every((pass) => !pass)) return [];
        const results = passes.map((pass) => pass ? calculateDmtDD(pass, lookup) : null);
        const complete = results.every((result) => result?.complete && !result.unmatched.length);
        return [{ name: `${set.name || `Set ${index + 1}`} · ${round === 0 ? "Preliminary" : "Final"} (passes ${numbers.join("–")})`,
            value: passes.flatMap((pass) => pass ? [pass.firstCode, pass.dismountCode] : []).join("\n"),
            difficulty: complete ? results.reduce((total, result) => total + Math.round((result?.total ?? 0) * 100), 0) / 100 : null }];
    }));
}

export function dmtWagcRounds(sets: DmtSetDraft[], lookup: DDLookupEntry[]) {
    return dmtNationalsRounds(sets.map((set) => ({ ...set,
        passes: set.passes.filter((pass) => pass.passNumber === 1 || pass.passNumber === 2),
    })), lookup);
}
