import { calculateDmtDD } from "./dmt-dd";
import type { DDLookupEntry } from "./dd";
import type { DmtSetDraft } from "./dmt-sets";

export function dmtPrintLines(sets: DmtSetDraft[], lookup: DDLookupEntry[], lookupError?: string | null) {
    const competitiveSet = sets[0];
    return Array.from({ length: 4 }, (_, index) => {
        const pass = competitiveSet?.passes.find((pass) => pass.passNumber === index + 1);
        if (!pass) return "";
        const result = calculateDmtDD(pass, lookup);
        const dd = lookupError ? "unavailable" : result.unmatched.length ? "unmatched skill" : !result.complete ? "incomplete" : result.total?.toFixed(2) ?? "—";
        return `${pass.firstPlacement === "mount" ? "Mount" : "Spotter"}: ${pass.firstCode || "—"} → Dismount: ${pass.dismountCode || "—"} · DD: ${dd}`;
    });
}
