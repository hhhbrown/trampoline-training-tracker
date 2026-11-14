import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dmtSetDraft, dmtSkillRows, dmtValidation, emptyDmtSet, saveDmtSet } from "./dmt-sets";

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
