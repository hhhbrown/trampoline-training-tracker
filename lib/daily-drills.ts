import type { SupabaseClient } from "@supabase/supabase-js";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export type DailyDrillEntry = { id: number; coach_id: number; day_of_week: number; exercise: string };
export type EditableDrill = DailyDrillEntry & { isNew?: boolean };
const fields = "id, coach_id, day_of_week, exercise";

export function validateDailyDrills(entries: EditableDrill[]) {
    if (entries.some((entry) => !entry.exercise.trim())) return "Every drill needs a name.";
    if (entries.some((entry) => !Number.isInteger(entry.day_of_week) || entry.day_of_week < 1 || entry.day_of_week > 7)) return "Choose a day from Monday to Sunday.";
    return null;
}

export async function saveDailyDrills(client: SupabaseClient, coachId: number, entries: EditableDrill[], deletedIds: number[], onSaved: (originalId: number, saved: DailyDrillEntry) => void, onDeleted: (id: number) => void) {
    const validation = validateDailyDrills(entries);
    if (validation) throw new Error(validation);
    for (const id of deletedIds) {
        const { data, error } = await client.from("daily_drills").delete().eq("id", id).eq("coach_id", coachId).select("id");
        if (error) throw new Error(`Error deleting drill: ${error.message}`);
        if (!data?.length) throw new Error("This drill could not be deleted. Reload and check your access.");
        onDeleted(id);
    }
    for (const entry of entries) {
        const values = { coach_id: coachId, day_of_week: entry.day_of_week, exercise: entry.exercise.trim() };
        const query = entry.isNew ? client.from("daily_drills").insert(values) : client.from("daily_drills").update(values).eq("id", entry.id).eq("coach_id", coachId);
        const { data, error } = await query.select(fields).single();
        if (error || !data) throw new Error(`Error saving ${entry.exercise}: ${error?.message ?? "Check your access and reload."}`);
        // Retain IDs as each write succeeds, so retrying a partial save does not duplicate drills.
        onSaved(entry.id, data);
    }
}
