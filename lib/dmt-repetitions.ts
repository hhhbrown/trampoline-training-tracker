import type { DmtSetDraft } from "./dmt-sets";

type Occurrence = { passNumber: number; placement: "mount" | "spotter" | "dismount" };
export type DmtRepetition = { code: string; occurrences: Occurrence[]; samePlacement: boolean; violation: boolean | null };

export function dmtRepetitionRule(level: string | null | undefined): "zone" | "wgym" | "unknown" {
    const name = level?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
    if (["level 6", "junior", "senior"].includes(name)) return "wgym";
    if (/^level [1-5]$/.test(name) || ["novice", "novice / level 5"].includes(name)) return "zone";
    return "unknown";
}

export function dmtRepetitions(set: DmtSetDraft, level?: string | null): DmtRepetition[] {
    const rule = dmtRepetitionRule(level);
    const byCode = new Map<string, Occurrence[]>();
    for (const pass of set.passes) {
        for (const [value, placement] of [[pass.firstCode, pass.firstPlacement], [pass.dismountCode, "dismount"]] as const) {
            const code = value.trim();
            if (!code) continue;
            byCode.set(code, [...(byCode.get(code) ?? []), { passNumber: pass.passNumber, placement }]);
        }
    }
    return [...byCode.entries()]
        .filter(([, occurrences]) => occurrences.length > 1)
        .map(([code, occurrences]) => {
            const samePlacement = new Set(occurrences.map((entry) => entry.placement)).size < occurrences.length;
            return { code, occurrences, samePlacement, violation: rule === "wgym" ? true : rule === "zone" ? samePlacement : null };
        });
}
