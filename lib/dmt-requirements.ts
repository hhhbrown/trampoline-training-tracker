import { assessDD, type LevelDDRequirement } from "./competition-dd";
import type { DDLookupEntry } from "./dd";
import { calculateDmtDD } from "./dmt-dd";
import type { DmtPassDraft } from "./dmt-sets";

export function dmtDDRange(rule: LevelDDRequirement) {
    if (rule.min_dd != null && rule.max_dd != null) return `Level DD range: ${Number(rule.min_dd).toFixed(2)}–${Number(rule.max_dd).toFixed(2)}`;
    if (rule.min_dd != null) return `Minimum DD: ${Number(rule.min_dd).toFixed(2)}`;
    if (rule.max_dd != null) return `Maximum DD: ${Number(rule.max_dd).toFixed(2)}`;
    return "No DD limits";
}

export function checkDmtPassDD(pass: DmtPassDraft, lookup: DDLookupEntry[], rule: LevelDDRequirement, levelName: string) {
    const result = calculateDmtDD(pass, lookup);
    if (!result.complete) return { total: result.total, status: "unknown" as const, message: "Complete both skills to check DD." };
    if (result.unmatched.length) return { total: result.total, status: "unknown" as const, message: `No DD match found for: ${result.unmatched.join(", ")}.` };
    return { total: result.total, ...assessDD(result.total ?? 0, rule, levelName, 1) };
}
