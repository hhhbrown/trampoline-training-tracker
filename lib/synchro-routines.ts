import { calculateDD, type DDLookupEntry } from "./dd";

export type SynchroRoutine = {
    id: number;
    athlete_id: number;
    routine_name: string;
    skills: string[];
    difficulty: number | null;
    notes: string | null;
};
export type SynchroDraft = {
    id: number | null;
    athleteId: number | null;
    name: string;
    skills: string;
    manualDifficulty: string | null;
    notes: string;
};
export function synchroDraft(record: SynchroRoutine | null, lookup: DDLookupEntry[], lookupError?: string): SynchroDraft {
    const skills = record?.skills.join("\n") ?? "";
    const calculated = calculateDD(skills, lookup).total;
    return {
        id: record?.id ?? null,
        athleteId: record?.athlete_id ?? null,
        name: record?.routine_name ?? "Synchro Routine",
        skills,
        manualDifficulty: record?.difficulty != null && (lookupError || record.difficulty !== calculated) ? String(record.difficulty) : null,
        notes: record?.notes ?? "",
    };
}
export function synchroDifficulty(draft: SynchroDraft, lookup: DDLookupEntry[], lookupError?: string) {
    return draft.manualDifficulty ?? (lookupError ? "" : calculateDD(draft.skills, lookup).total?.toFixed(2) ?? "");
}
export function synchroPayload(draft: SynchroDraft, athleteId: number, lookup: DDLookupEntry[], lookupError?: string) {
    const difficulty = synchroDifficulty(draft, lookup, lookupError);
    return {
        athlete_id: athleteId,
        routine_name: draft.name.trim() || "Synchro Routine",
        skills: draft.skills.split(/[,\r\n]+/).map((skill) => skill.trim()).filter(Boolean),
        difficulty: difficulty === "" ? null : Number(difficulty),
        notes: draft.notes.trim() || null,
        updated_at: new Date().toISOString(),
    };
}

// Read one shared collection for a club pair, without duplicating routine records.
export function sharedSynchroAthleteIds(athlete: { id: number; external_synchro_partner_id?: number | null }, pairing?: {
    partner: { id: number } | null;
    conflict: boolean;
}) {
    if (athlete.external_synchro_partner_id || pairing?.conflict || !pairing?.partner) return [athlete.id];
    return [...new Set([athlete.id, pairing.partner.id])].sort((a, b) => a - b);
}
