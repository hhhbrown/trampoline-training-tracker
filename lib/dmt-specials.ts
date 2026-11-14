import { dmtRepetitions } from "./dmt-repetitions";
import { calculateDD, type DDLookupEntry } from "./dd";
import type { DmtPassDraft, DmtSetDraft } from "./dmt-sets";

export type DmtSpecialCheck = { title: string; status: "met" | "unmet" | "unknown"; message: string };

function isNoviceOrLevel5(level: string) {
    return /^(?:novice|level\s+5|novice\s*\/\s*level\s+5)$/i.test(level.trim());
}

function hasFullSomersault(value: string) {
    const code = value.trim().replace(/^\.+/, "");
    // FIG prefixes count quarter somersaults; preserve multi-digit triple+ prefixes.
    const quarters = code.match(/^(12|16|20|[0-9])/);
    return quarters != null && Number(quarters[1]) >= 4;
}

export function checkDmtSpecials(pass: DmtPassDraft, level: string, lookup: DDLookupEntry[]): DmtSpecialCheck[] {
    if (isNoviceOrLevel5(level) || /^(?:junior|level\s+6|senior)$/i.test(level.trim())) {
        const codes = [pass.firstCode.trim(), pass.dismountCode.trim()].filter(Boolean);
        const invalid = codes.filter((code) => !hasFullSomersault(code));
        const checks: DmtSpecialCheck[] = [
            { title: "2 elements", status: codes.length === 2 ? "met" : "unknown", message: codes.length === 2 ? "Both elements entered" : "Enter both elements for this pass" },
            { title: "At least 360° somersault in every element", status: invalid.length ? "unmet" : codes.length === 2 ? "met" : "unknown",
                message: invalid.length ? `Interruption: ${invalid.join(", ")} has less than 360° somersault`
                    : codes.length === 2 ? "Both elements meet the somersault requirement" : "Complete both elements to check for interruptions" },
        ];
        if (/^(?:junior|level\s+6)$/i.test(level.trim())) {
            const double = codes.some((code) => code.replace(/^\.+/, "").startsWith("8"));
            checks.push({ title: "One double salto in each pass", status: double ? "met" : codes.length < 2 ? "unknown" : "unmet",
                message: double ? "This pass includes an element starting with 8" : codes.length < 2 ? "Complete both elements to check this requirement" : "At least one element in this pass must start with 8" });
        }
        if (isNoviceOrLevel5(level) && (pass.passNumber === 3 || pass.passNumber === 4)) {
            const values = codes.map((code) => ({ code, result: calculateDD(code, lookup) }));
            const qualifying = values.find(({ result }) => !result.unmatched.length && result.total != null && Math.round(result.total * 100) >= 120);
            const unknown = codes.length < 2 || values.some(({ result }) => result.unmatched.length > 0);
            checks.push({ title: "Element of 1.20 DD or more · Final", status: qualifying ? "met" : unknown ? "unknown" : "unmet",
                message: qualifying ? `${qualifying.code}: ${qualifying.result.total!.toFixed(2)} DD`
                    : unknown ? "Complete both skills and resolve unmatched FIG codes to check this requirement"
                    : "At least one individual element in this final pass must be worth 1.20 DD or more" });
        }
        return checks;
    }
    if (/^level\s+[34]$/i.test(level.trim())) {
        const first = pass.firstCode.trim().replace(/^\.+/, "");
        const dismount = pass.dismountCode.trim().replace(/^\.+/, "");
        const complete = Boolean(first && dismount);
        const valid = (first.startsWith("4") && dismount.startsWith("4"))
            || (first.startsWith("-") && dismount.startsWith("8"));
        return [
            { title: "2 elements", status: complete ? "met" : "unknown", message: complete ? "Both elements entered" : "Enter both elements for this pass" },
            { title: "Two saltos or a double dismount", status: !complete ? "unknown" : valid ? "met" : "unmet",
                message: !complete ? "Complete both elements to check this requirement"
                    : valid ? `${pass.firstCode.trim()} → ${pass.dismountCode.trim()}`
                    : "Both skills must start with 4, or the mount/spotter must start with - and the dismount with 8" },
        ];
    }
    const number = /^level\s+([12])$/i.exec(level.trim())?.[1];
    if (!number) return [];
    const minimum = number === "2" ? 0.7 : 0.5;
    const minimumLabel = minimum.toFixed(2);
    const codes = [pass.firstCode.trim(), pass.dismountCode.trim()].filter(Boolean);
    const values = codes.map((code) => ({ code, result: calculateDD(code, lookup) }));
    const qualifying = values.find(({ result }) => !result.unmatched.length && result.total != null && Math.round(result.total * 100) >= Math.round(minimum * 100));
    const unknown = codes.length < 2 || values.some(({ result }) => result.unmatched.length > 0);
    return [
        { title: "2 elements", status: codes.length === 2 ? "met" : "unknown", message: codes.length === 2 ? "Both elements entered" : "Enter both elements for this pass" },
        {
            title: `Element of ${minimumLabel} DD or more`,
            status: qualifying ? "met" : unknown ? "unknown" : "unmet",
            message: qualifying ? `${qualifying.code}: ${qualifying.result.total!.toFixed(2)} DD`
                : unknown ? "Complete both skills and resolve unmatched FIG codes to check this requirement"
                : `At least one individual element in this pass must be worth ${minimumLabel} DD or more`,
        },
    ];
}

export function checkDmtSetSpecials(set: DmtSetDraft, level: string, lookup: DDLookupEntry[] = []): DmtSpecialCheck[] {
    if (/^(?:junior|level\s+6|senior)$/i.test(level.trim())) {
        const repeats = dmtRepetitions(set, level);
        const complete = set.passes.length === 2 && set.passes.every((pass) => pass.firstCode.trim() && pass.dismountCode.trim());
        return [{ title: "Four unique elements across both passes", status: repeats.length ? "unmet" : complete ? "met" : "unknown",
            message: repeats.length ? `Repetition not allowed anywhere in this set: ${repeats.map((repeat) => `${repeat.code} (${repeat.occurrences.map((entry) => `Pass ${entry.passNumber} · ${entry.placement}`).join("; ")})`).join(", ")}`
                : complete ? "All four elements are different" : "Complete both passes to check all four elements" }];
    }
    if (isNoviceOrLevel5(level)) {
        const passes = [1, 2].map((number) => set.passes.find((pass) => pass.passNumber === number));
        const elements = passes.flatMap((pass) => pass ? [pass.firstCode, pass.dismountCode].map((code) => ({ code: code.trim(), passNumber: pass.passNumber, result: calculateDD(code, lookup) })) : []);
        const qualifying = elements.find(({ result }) => !result.unmatched.length && result.total != null && Math.round(result.total * 100) >= 200);
        const unknown = passes.some((pass) => !pass?.firstCode.trim() || !pass.dismountCode.trim()) || elements.some(({ result }) => result.unmatched.length > 0);
        return [{ title: "Element of 2.00 DD or more · Preliminary (passes 1–2)", status: qualifying ? "met" : unknown ? "unknown" : "unmet",
            message: qualifying ? `Pass ${qualifying.passNumber}: ${qualifying.code} (${qualifying.result.total!.toFixed(2)} DD)`
                : unknown ? "Complete the preliminary passes and resolve unmatched FIG codes to check this requirement"
                : "At least one individual element in passes 1–2 must be worth 2.00 DD or more" }];
    }
    if (/^level\s+[34]$/i.test(level.trim())) {
        return [[1, 2], [3, 4]].map((numbers, round) => {
            const passes = numbers.map((number) => set.passes.find((pass) => pass.passNumber === number));
            const elements = passes.flatMap((pass) => pass ? [pass.firstCode, pass.dismountCode].map((code) => ({ code: code.trim(), passNumber: pass.passNumber, result: calculateDD(code, lookup) })) : []);
            const qualifying = elements.find(({ result }) => !result.unmatched.length && result.total != null && Math.round(result.total * 100) >= 90);
            const unknown = passes.some((pass) => !pass?.firstCode.trim() || !pass.dismountCode.trim()) || elements.some(({ result }) => result.unmatched.length > 0);
            return {
                title: `Element of 0.90 DD or more · ${round === 0 ? "Preliminary" : "Final"} (passes ${numbers.join("–")})`,
                status: qualifying ? "met" : unknown ? "unknown" : "unmet",
                message: qualifying ? `Pass ${qualifying.passNumber}: ${qualifying.code} (${qualifying.result.total!.toFixed(2)} DD)`
                    : unknown ? "Complete the passes and resolve unmatched FIG codes to check this requirement"
                    : "At least one individual element in this pair of passes must be worth 0.90 DD or more",
            };
        });
    }
    if (!/^level\s+2$/i.test(level.trim())) return [];
    return [[1, 2], [3, 4]].map((numbers, round) => {
        const passes = numbers.map((number) => set.passes.find((pass) => pass.passNumber === number));
        const qualifying = passes.find((pass) => pass && [pass.firstCode, pass.dismountCode].every((code) => /^4/.test(code.trim().replace(/^\.+/, ""))));
        const incomplete = passes.some((pass) => !pass?.firstCode.trim() || !pass.dismountCode.trim());
        return {
            title: `Two saltos · ${round === 0 ? "Preliminary" : "Final"} (passes ${numbers.join("–")})`,
            status: qualifying ? "met" : incomplete ? "unknown" : "unmet",
            message: qualifying ? `Pass ${qualifying.passNumber}: both elements start with 4`
                : incomplete ? "Complete the passes to check for a two-salto pass"
                : "At least one pass in this pair must have both elements starting with 4",
        };
    });
}

export function dmtMountBonus(set: DmtSetDraft, level: string) {
    if (!/^level\s+2$/i.test(level.trim())) return { total: 0, codes: [] as string[] };
    const codes = [...new Set(set.passes.filter((pass) => pass.firstPlacement === "mount")
        .map((pass) => pass.firstCode.trim().replace(/^\.+/, ""))
        .filter((code) => ["41o", "41<", "41/"].includes(code)))];
    return { total: codes.length * 0.5, codes };
}

export function dmtJuniorMountBonus(pass: DmtPassDraft, level: string, gender: string | null) {
    const women = /^(female|woman|women)$/i.test(gender?.trim() ?? "");
    return /^junior$/i.test(level.trim()) && women && pass.firstPlacement === "mount"
        && pass.firstCode.trim().replace(/^\.+/, "") === "8-1<" ? 0.5 : 0;
}
