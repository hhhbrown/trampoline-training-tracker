import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateDmtDD, loadDmtDDLookup } from "./dmt-dd";
import { emptyDmtSet } from "./dmt-sets";

const lookup = [{ fig_code: "43", difficulty: "0.80" }, { fig_code: "8--o", difficulty: 1.1 }];
const pass = { ...emptyDmtSet().passes[0], firstCode: "43", dismountCode: "8--o" };

test("sums both DMT skills from the supplied lookup", () => {
    const result = calculateDmtDD(pass, lookup);
    assert.equal(result.total, 1.9);
    assert(result.complete);
    assert.deepEqual(result.unmatched, []);
    assert.equal(calculateDmtDD(pass, [{ fig_code: "43", difficulty: 2 }, { fig_code: "8--o", difficulty: 3 }]).total, 5);
});

test("normalizes whitespace and leading periods without changing stored codes", () => {
    const draft = { ...pass, firstCode: " .43 " };
    assert.equal(calculateDmtDD(draft, lookup).total, 1.9);
    assert.equal(draft.firstCode, " .43 ");
});

test("does not apply repetition penalties or placement restrictions", () => {
    assert.equal(calculateDmtDD({ ...pass, firstCode: "43", dismountCode: "43", firstPlacement: "spotter" }, lookup).total, 1.6);
    assert.equal(calculateDmtDD({ ...pass, firstPlacement: "spotter" }, lookup).total, 1.9);
});

test("flags unmatched codes instead of presenting a complete known total", () => {
    const result = calculateDmtDD({ ...pass, dismountCode: "missing" }, lookup);
    assert.equal(result.total, 0.8);
    assert.deepEqual(result.unmatched, ["missing"]);
});

test("distinguishes empty and incomplete passes", () => {
    assert.equal(calculateDmtDD(emptyDmtSet().passes[0], lookup).total, null);
    const result = calculateDmtDD({ ...pass, dismountCode: "" }, lookup);
    assert.equal(result.total, 0.8);
    assert(!result.complete);
});

test("loads DMT values from dmt_dd_lookup only, with clear empty/error states", async () => {
    let queried = "";
    const client = { from: (table: string) => { queried = table; return { select: async () => ({ data: lookup, error: null }) }; } } as unknown as SupabaseClient;
    assert.deepEqual((await loadDmtDDLookup(client)).entries, lookup);
    assert.equal(queried, "dmt_dd_lookup");
    for (const response of [{ data: [], error: null }, { data: null, error: { message: "Permission denied" } }]) {
        const unavailable = { from: () => ({ select: async () => response }) } as unknown as SupabaseClient;
        assert((await loadDmtDDLookup(unavailable)).error);
    }
});
