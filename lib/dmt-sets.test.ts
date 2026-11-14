import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dmtPassCount, dmtSetDraft, dmtSkillRows, dmtValidation, emptyDmtSet, loadDmtSets, saveDmtSet } from "./dmt-sets";

test("Set 1 defaults to two passes, each starting with a mount", () => {
    const set = emptyDmtSet();
    assert.equal(set.id, null);
    assert.deepEqual(set.passes.map((pass) => [pass.passNumber, pass.firstPlacement]), [[1, "mount"], [2, "mount"]]);
});

test("loads placement and codes by position, not row order", () => {
    const set = dmtSetDraft({ id: 10, dmt_passes: [{ id: 20, pass_number: 2, dmt_pass_skills: [{ position: 2, placement: "dismount", fig_code: "8-1o" }, { position: 1, placement: "spotter", fig_code: "8--o" }] }] });
    assert.equal(set.passes[0].id, null);
    assert.equal(set.passes[1].id, 20);
    assert.equal(set.passes[1].firstPlacement, "spotter");
    assert.equal(set.passes[1].dismountCode, "8-1o");
});

test("incomplete and multi-code fields fail validation", () => {
    const set = emptyDmtSet();
    assert.equal(dmtValidation(set), null);
    set.passes[0].firstCode = "43";
    assert.match(dmtValidation(set)!, /both/);
    set.passes[0].dismountCode = "8-1o";
    assert.equal(dmtValidation(set), null);
    set.passes[0].firstCode = "43,44";
    assert.match(dmtValidation(set)!, /one FIG code/);
});

test("writes mount/spotter as position 1, dismount as position 2", () => {
    const rows = dmtSkillRows({ id: 20, passNumber: 1, firstPlacement: "spotter", firstCode: " .43 ", dismountCode: " 8-1o " });
    assert.deepEqual(rows, [{ pass_id: 20, position: 1, placement: "spotter", fig_code: ".43" }, { pass_id: 20, position: 2, placement: "dismount", fig_code: "8-1o" }]);
});

test("does not silently overwrite unnumbered or duplicate passes", () => {
    assert.throws(() => dmtSetDraft({ id: 1, dmt_passes: [{ id: 2, pass_number: null, dmt_pass_skills: [] }] }), /pass number/);
    assert.throws(() => dmtSetDraft({ id: 1, dmt_passes: [2, 3].map((id) => ({ id, pass_number: 1, dmt_pass_skills: [] })) }), /more than one/);
});

test("creates set/pass IDs once and reuses them on subsequent saves", async () => {
    const writes: { table: string; value: unknown }[] = [];
    const client = { from: (table: string) => ({
        insert: (value: unknown) => { writes.push({ table, value }); return { select: () => ({ single: async () => ({ data: { id: table === "dmt_sets" ? 10 : 20 }, error: null }) }) }; },
        upsert: async (value: unknown) => { writes.push({ table, value }); return { error: null }; },
    }) } as unknown as SupabaseClient;
    let draft = emptyDmtSet();
    draft.passes[0] = { ...draft.passes[0], firstPlacement: "spotter", firstCode: "43", dismountCode: "8-1o" };
    await saveDmtSet(client, 7, draft, (value) => { draft = value; });
    assert.equal(draft.id, 10);
    assert.equal(draft.passes[0].id, 20);
    assert.deepEqual(writes.map((write) => write.table), ["dmt_sets", "dmt_passes", "dmt_pass_skills"]);
    writes.length = 0;
    await saveDmtSet(client, 7, draft, (value) => { draft = value; });
    assert.deepEqual(writes.map((write) => write.table), ["dmt_pass_skills"]);
});

test("an entirely empty new set makes no database writes", async () => {
    await saveDmtSet({ from: () => { throw new Error("Unexpected database write"); } } as unknown as SupabaseClient, 7, emptyDmtSet(), () => {});
});

test("Levels 1–Novice/5 get four passes, advanced levels get two", () => {
    for (const level of ["Level 1", "Level 2", "Level 3", "Level 4", "Novice", "Level 5", "Novice / Level 5"]) {
        assert.equal(dmtPassCount(level), 4);
        assert.deepEqual(emptyDmtSet(level).passes.map((pass) => pass.passNumber), [1, 2, 3, 4]);
    }
    for (const level of ["Level 6", "Junior", "Senior"]) assert.equal(emptyDmtSet(level).passes.length, 2);
});

test("loads all four passes for zone levels and keeps existing skills", () => {
    const record = { id: 1, dmt_passes: [1, 2, 3, 4].map((pass_number) => ({ id: pass_number + 10, pass_number, dmt_pass_skills: [{ position: 1, placement: "mount", fig_code: "43" }, { position: 2, placement: "dismount", fig_code: "8-1o" }] })) };
    assert.equal(dmtSetDraft(record, "Level 5").passes[3].id, 14);
    assert.equal(dmtSetDraft(record, "Level 5").passes[3].dismountCode, "8-1o");
    assert.equal(dmtSetDraft(record, "Senior").passes.length, 2);
    assert.equal(record.dmt_passes.length, 4);
});

test("loads every set with its own name, IDs and passes", async () => {
    const records = [1, 2].map((id) => ({ id, name: `Set ${id}`, dmt_passes: [{ id: id * 10, pass_number: 1, dmt_pass_skills: [{ position: 1, placement: "mount", fig_code: id === 1 ? "43" : "44" }, { position: 2, placement: "dismount", fig_code: "8-1o" }] }] }));
    const client = { from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: records, error: null }) }) }) }) } as unknown as SupabaseClient;
    const loaded = await loadDmtSets(client, 7, "Level 5");
    assert.equal(loaded.error, null);
    assert.deepEqual(loaded.drafts.map((set) => set.name), ["Set 1", "Set 2"]);
    assert.deepEqual(loaded.drafts.map((set) => set.passes[0].firstCode), ["43", "44"]);
    assert(loaded.drafts.every((set) => set.passes.length === 4));
});

test("explicitly added empty sets can be saved and retain their name", async () => {
    let inserted: unknown;
    const client = { from: () => ({ insert: (value: unknown) => { inserted = value; return { select: () => ({ single: async () => ({ data: { id: 22 }, error: null }) }) }; } }) } as unknown as SupabaseClient;
    let draft = emptyDmtSet("Senior", "Set 2");
    await saveDmtSet(client, 7, draft, (value) => { draft = value; }, true);
    assert.deepEqual(inserted, { athlete_id: 7, name: "Set 2" });
    assert.equal(draft.id, 22);
    assert.equal(draft.passes.length, 2);
});

test("exposes at most the first two sets in database order without deleting extras", async () => {
    const records = [1, 2, 3].map((id) => ({ id, name: `Set ${id}`, dmt_passes: [] }));
    const client = { from: () => ({ select: () => ({ eq: () => ({ order: async () => ({ data: records, error: null }) }) }) }) } as unknown as SupabaseClient;
    const result = await loadDmtSets(client, 7, "Level 4");
    assert.deepEqual(result.drafts.map((set) => set.id), [1, 2]);
    assert.equal(records.length, 3);
});
