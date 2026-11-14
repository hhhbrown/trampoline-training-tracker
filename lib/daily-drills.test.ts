import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DAYS, saveDailyDrills, validateDailyDrills, type DailyDrillEntry, type EditableDrill } from "./daily-drills";
const base: EditableDrill = { id: -1, coach_id: 7, day_of_week: 1, exercise: " Straight jumps ", isNew: true };
function mockClient(failExercise?: string) {
    const rows = new Map<number, DailyDrillEntry>();
    const writes: { table: string; operation: string; filters: Record<string, unknown> }[] = [];
    let nextId = 1;
    const client = { from(table: string) {
        let operation = ""; let values: Partial<DailyDrillEntry> = {}; const filters: Record<string, unknown> = {};
        const execute = () => {
            writes.push({ table, operation, filters: { ...filters } });
            if (failExercise != null && values.exercise === failExercise) return { data: null, error: { message: "Access denied" } };
            if (operation === "insert") { const row = { ...values, id: nextId++ } as DailyDrillEntry; rows.set(row.id, row); return { data: row, error: null }; }
            const row = rows.get(Number(filters.id));
            if (!row || row.coach_id !== filters.coach_id) return { data: operation === "delete" ? [] : null, error: null };
            if (operation === "delete") { rows.delete(row.id); return { data: [{ id: row.id }], error: null }; }
            const updated = { ...row, ...values }; rows.set(row.id, updated); return { data: updated, error: null };
        };
        const query = {
            insert(payload: Partial<DailyDrillEntry>) { operation = "insert"; values = payload; return query; },
            update(payload: Partial<DailyDrillEntry>) { operation = "update"; values = payload; return query; },
            delete() { operation = "delete"; return query; },
            eq(key: string, value: unknown) { filters[key] = value; return query; },
            select() { return operation === "delete" ? Promise.resolve(execute()) : { single: async () => execute() }; },
        }; return query;
    } } as unknown as SupabaseClient;
    return { client, rows, writes };
}
test("supports Monday through Sunday and validates text and day selection", () => {
    assert.deepEqual([DAYS[0], DAYS[6], DAYS.length], ["Monday", "Sunday", 7]);
    assert.equal(validateDailyDrills([base]), null);
    for (const changed of [{ exercise:" " }, { day_of_week:8 }]) assert(validateDailyDrills([{...base,...changed}]));
});
test("inserts, edits and deletes multiple drills, isolated from Conditioning and scoped to coach", async () => {
    const { client, rows, writes } = mockClient();
    let entries: EditableDrill[] = [base, {...base,id:-2,day_of_week:7,exercise:"Seat drops"}];
    const onSaved = (id: number, saved: DailyDrillEntry) => { entries = entries.map((entry) => entry.id === id ? saved : entry); };
    await saveDailyDrills(client, 7, entries, [], onSaved, () => {});
    assert.equal(rows.size, 2);
    assert.equal(entries[0].exercise, "Straight jumps");
    assert(entries.every((entry) => entry.id > 0 && !entry.isNew));
    entries[0] = {...entries[0], exercise:"Updated drill"};
    await saveDailyDrills(client, 7, entries, [], onSaved, () => {});
    assert.equal(rows.size, 2);
    assert.equal(rows.get(entries[0].id)?.exercise, "Updated drill");
    assert.deepEqual(Object.keys(rows.get(entries[0].id)!).sort(), ["coach_id", "day_of_week", "exercise", "id"]);
    const deleted: number[] = [];
    await saveDailyDrills(client, 7, [], [entries[0].id], onSaved, (id) => deleted.push(id));
    assert.equal(rows.size, 1);
    assert.deepEqual(deleted, [entries[0].id]);
    assert(writes.every((write) => write.table === "daily_drills"));
    assert(writes.filter((write) => write.operation !== "insert").every((write) => write.filters.coach_id === 7));
});
test("partial insert failures preserve generated IDs for retries", async () => {
    const { client, rows } = mockClient("Fail");
    let entries: EditableDrill[] = [base, {...base,id:-2,exercise:"Fail"}];
    const onSaved = (id:number,saved:DailyDrillEntry) => { entries = entries.map((entry) => entry.id === id ? saved : entry); };
    await assert.rejects(saveDailyDrills(client, 7, entries, [], onSaved, () => {}), /Access denied/);
    assert.equal(entries[0].id, 1);
    entries[1] = {...entries[1],exercise:"Fixed"};
    await saveDailyDrills(client, 7, entries, [], onSaved, () => {});
    assert.equal(rows.size, 2);
});
test("denied deletion and invalid entries do not report success", async () => {
    const { client, writes } = mockClient();
    await assert.rejects(saveDailyDrills(client, 7, [{...base,exercise:" "}], [], () => {}, () => {}), /Every drill/);
    assert.equal(writes.length, 0);
    let deleted = false;
    await assert.rejects(saveDailyDrills(client, 7, [], [99], () => {}, () => { deleted = true; }), /could not be deleted/);
    assert(!deleted);
});
