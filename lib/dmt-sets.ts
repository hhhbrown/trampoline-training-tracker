import { dmtRepetitionRule } from "./dmt-repetitions";
import type { SupabaseClient } from "@supabase/supabase-js";

export const MAX_DMT_SETS = 2;

export type DmtPassDraft = {
    id: number | null;
    passNumber: number;
    firstPlacement: "mount" | "spotter";
    firstCode: string;
    dismountCode: string;
};
export type DmtSetDraft = { id: number | null; name?: string; passes: DmtPassDraft[] };
type SkillRecord = { position: number; placement: string; fig_code: string };
export type DmtSetRecord = { id: number; name?: string; dmt_passes: { id: number; pass_number: number | null; dmt_pass_skills: SkillRecord[] }[] };

export function dmtPassCount(level?: string | null) {
    return dmtRepetitionRule(level) === "zone" ? 4 : 2;
}

export function emptyDmtSet(level?: string | null, name = "Set 1"): DmtSetDraft {
    return { id: null, name, passes: Array.from({ length: dmtPassCount(level) }, (_, index) => index + 1).map((passNumber) => ({ id: null, passNumber, firstPlacement: "mount", firstCode: "", dismountCode: "" })) };
}

export function dmtSetDraft(record: DmtSetRecord | null, level?: string | null): DmtSetDraft {
    if (!record) return emptyDmtSet(level);
    if (record.dmt_passes.some((pass) => pass.pass_number == null || !Number.isInteger(pass.pass_number) || pass.pass_number < 1 || pass.pass_number > 4)) throw new Error("DMT set has passes without a supported pass number. Assign pass numbers 1–4 before editing.");
    return {
        id: record.id,
        name: record.name || "Set 1",
        passes: Array.from({ length: dmtPassCount(level) }, (_, index) => index + 1).map((passNumber) => {
            const candidates = record.dmt_passes.filter((pass) => pass.pass_number === passNumber);
            if (candidates.length > 1) throw new Error(`DMT set has more than one Pass ${passNumber}. Review the database entries.`);
            const pass = candidates[0];
            const first = pass?.dmt_pass_skills.find((skill) => skill.position === 1);
            const dismount = pass?.dmt_pass_skills.find((skill) => skill.position === 2);
            return { id: pass?.id ?? null, passNumber, firstPlacement: first?.placement === "spotter" ? "spotter" : "mount", firstCode: first?.fig_code ?? "", dismountCode: dismount?.fig_code ?? "" };
        }),
    };
}

export async function loadDmtSets(client: SupabaseClient, athleteId: number, level?: string | null) {
    const { data, error } = await client.from("dmt_sets")
        .select("id, name, dmt_passes(id, pass_number, dmt_pass_skills(position, placement, fig_code))")
        .eq("athlete_id", athleteId).order("id");
    if (error) return { drafts: [emptyDmtSet(level)], error: "DMT sets could not be loaded. Check access to dmt_sets, dmt_passes, and dmt_pass_skills." };
    try {
        const records = (data ?? []) as DmtSetRecord[];
        return { drafts: records.length ? records.slice(0, MAX_DMT_SETS).map((record, index) => dmtSetDraft({ ...record, name: record.name || `Set ${index + 1}` }, level)) : [emptyDmtSet(level)], error: null };
    } catch (error) { return { drafts: [emptyDmtSet(level)], error: error instanceof Error ? error.message : "DMT sets could not be loaded." }; }
}

export async function loadDmtSet(client: SupabaseClient, athleteId: number, level?: string | null) {
    const result = await loadDmtSets(client, athleteId, level);
    return { draft: result.drafts[0], error: result.error };
}

export function dmtValidation(set: DmtSetDraft) {
    for (const pass of set.passes) {
        if (Boolean(pass.firstCode.trim()) !== Boolean(pass.dismountCode.trim())) return `DMT Pass ${pass.passNumber}: enter both the first skill and dismount, or leave both blank.`;
        if ([pass.firstCode, pass.dismountCode].some((code) => /[,\r\n]/.test(code))) return `DMT Pass ${pass.passNumber}: enter one FIG code in each field.`;
    }
    return null;
}

export function dmtSkillRows(pass: DmtPassDraft & { id: number }) {
    return [
        { pass_id: pass.id, position: 1, placement: pass.firstPlacement, fig_code: pass.firstCode.trim() },
        { pass_id: pass.id, position: 2, placement: "dismount", fig_code: pass.dismountCode.trim() },
    ];
}

export async function saveDmtSet(client: SupabaseClient, athleteId: number, draft: DmtSetDraft, onProgress: (draft: DmtSetDraft) => void, persistEmpty = false) {
    const validation = dmtValidation(draft);
    if (validation) throw new Error(validation);
    let current = { ...draft, passes: draft.passes.map((pass) => ({ ...pass })) };
    if (!persistEmpty && current.id == null && current.passes.every((pass) => !pass.firstCode.trim())) return;
    if (current.id == null) {
        const { data, error } = await client.from("dmt_sets").insert({ athlete_id: athleteId, name: draft.name || "Set 1" }).select("id").single();
        if (error) throw new Error(error.message);
        current = { ...current, id: data.id };
        onProgress(current);
    }
    for (const [index, original] of current.passes.entries()) {
        let pass = original;
        if (!pass.firstCode.trim()) {
            if (pass.id != null) {
                const { error } = await client.from("dmt_pass_skills").delete().eq("pass_id", pass.id);
                if (error) throw new Error(error.message);
            }
            continue;
        }
        if (pass.id == null) {
            const { data, error } = await client.from("dmt_passes").insert({ athlete_id: athleteId, set_id: current.id, pass_number: pass.passNumber, name: `Pass ${pass.passNumber}` }).select("id").single();
            if (error) throw new Error(error.message);
            pass = { ...pass, id: data.id };
            current = { ...current, passes: current.passes.map((row, i) => i === index ? pass : row) };
            onProgress(current);
        }
        const { error } = await client.from("dmt_pass_skills").upsert(dmtSkillRows({ ...pass, id: pass.id! }), { onConflict: "pass_id,position" });
        if (error) throw new Error(error.message);
    }
}
