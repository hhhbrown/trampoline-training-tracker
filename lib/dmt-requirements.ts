import type { LevelDDRequirement } from "./competition-dd";
import type { DDLookupEntry } from "./dd";
import { calculateDmtDD } from "./dmt-dd";
import type { DmtPassDraft } from "./dmt-sets";

export function dmtDDRange(rule: LevelDDRequirement) {
    if (rule.min_dd != null && rule.max_dd != null) return `Level DD range: ${Number(rule.min_dd).toFixed(2)}–${Number(rule.max_dd).toFixed(2)}`;
    if (rule.min_dd != null) return `Minimum DD: ${Number(rule.min_dd).toFixed(2)}`;
    if (rule.max_dd != null) return `Maximum DD: ${Number(rule.max_dd).toFixed(2)}`;
    return "No DD limits";
}

export function checkDmtPassDD(pass: DmtPassDraft, lookup: DDLookupEntry[], rule: LevelDDRequirement) {
    const result = calculateDmtDD(pass, lookup);
    if (!result.complete) return { total: result.total, status: "unknown" as const, message: "Complete both skills to check DD." };
    if (result.unmatched.length) return { total: result.total, status: "unknown" as const, message: `No DD match found for: ${result.unmatched.join(", ")}.` };
    const dd = Math.round((result.total ?? 0) * 100);
    const minimum = rule.min_dd == null ? null : Math.round(Number(rule.min_dd) * 100);
    const maximum = rule.max_dd == null ? null : Math.round(Number(rule.max_dd) * 100);
    if (minimum != null && dd < minimum) return { total: result.total, status: "under" as const, message: `${((minimum - dd) / 100).toFixed(2)} DD below minimum` };
    if (maximum != null && dd > maximum) return { total: result.total, status: "over" as const, message: `${((dd - maximum) / 100).toFixed(2)} DD above the level range` };
    return { total: result.total, status: "met" as const, message: "Meets DD requirement" };
}
