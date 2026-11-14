import assert from "node:assert/strict";
import test from "node:test";
import { checkDmtPassDD, dmtDDRange } from "./dmt-requirements";
import { emptyDmtSet } from "./dmt-sets";

const rule = { level_id: 17, gender: null, min_dd: 0.5, max_dd: 0.8 };
const pass = { ...emptyDmtSet().passes[0], firstCode: "first", dismountCode: "second" };
const lookup = (first: number, second: number) => [{ fig_code: "first", difficulty: first }, { fig_code: "second", difficulty: second }];

test("DD minimum and maximum are inclusive", () => {
    assert.equal(checkDmtPassDD(pass, lookup(0.2, 0.3), rule, "Level 1").status, "met");
    assert.equal(checkDmtPassDD(pass, lookup(0.4, 0.4), rule, "Level 1").status, "met");
});

test("reports the exact shortfall or excess without floating-point drift", () => {
    const below = checkDmtPassDD(pass, lookup(0.2, 0.2), rule, "Level 1");
    assert.equal(below.status, "warning");
    assert.equal(below.message, "0.10 DD below minimum. Coach warning only; no penalty for Levels 1–4.");
    const above = checkDmtPassDD(pass, lookup(0.5, 0.4), rule, "Level 1");
    assert.equal(above.status, "over");
    assert.equal(above.message, "0.10 DD above the level range. No penalty.");
});

test("unbounded maximum permits higher difficulty", () => {
    assert.equal(checkDmtPassDD(pass, lookup(5, 5), { ...rule, max_dd: null }, "Level 1").status, "met");
    assert.equal(dmtDDRange({ ...rule, max_dd: null }), "Minimum DD: 0.50");
});

test("incomplete or unmatched skills never pass a DD requirement", () => {
    assert.equal(checkDmtPassDD({ ...pass, dismountCode: "" }, lookup(1, 1), rule, "Level 1").status, "unknown");
    const missing = checkDmtPassDD(pass, [], rule, "Level 1");
    assert.equal(missing.status, "unknown");
    assert.match(missing.message, /first, second/);
});

 test("advanced DMT penalties equal the shortfall and are capped at 1.0", () => {
    for (const level of ["Novice", "Level 5", "Level 6", "Junior", "Senior"]) {
        const result = checkDmtPassDD(pass, lookup(0.2, 0.2), rule, level);
        assert.equal(result.status, "penalty");
        assert.equal("penalty" in result && result.penalty, 0.1);
        const capped = checkDmtPassDD(pass, lookup(0.2, 0.2), { ...rule, min_dd: 2 }, level);
        assert.equal("penalty" in capped && capped.penalty, 1);
    }
});
