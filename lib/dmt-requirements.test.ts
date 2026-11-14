import assert from "node:assert/strict";
import test from "node:test";
import { checkDmtPassDD, dmtDDRange } from "./dmt-requirements";
import { emptyDmtSet } from "./dmt-sets";

const rule = { level_id: 17, gender: null, min_dd: 0.5, max_dd: 0.8 };
const pass = { ...emptyDmtSet().passes[0], firstCode: "first", dismountCode: "second" };
const lookup = (first: number, second: number) => [{ fig_code: "first", difficulty: first }, { fig_code: "second", difficulty: second }];

test("DD minimum and maximum are inclusive", () => {
    assert.equal(checkDmtPassDD(pass, lookup(0.2, 0.3), rule).status, "met");
    assert.equal(checkDmtPassDD(pass, lookup(0.4, 0.4), rule).status, "met");
});

test("reports the exact shortfall or excess without floating-point drift", () => {
    const below = checkDmtPassDD(pass, lookup(0.2, 0.2), rule);
    assert.equal(below.status, "under");
    assert.equal(below.message, "0.10 DD below minimum");
    const above = checkDmtPassDD(pass, lookup(0.5, 0.4), rule);
    assert.equal(above.status, "over");
    assert.equal(above.message, "0.10 DD above the level range");
});

test("unbounded maximum permits higher difficulty", () => {
    assert.equal(checkDmtPassDD(pass, lookup(5, 5), { ...rule, max_dd: null }).status, "met");
    assert.equal(dmtDDRange({ ...rule, max_dd: null }), "Minimum DD: 0.50");
});

test("incomplete or unmatched skills never pass a DD requirement", () => {
    assert.equal(checkDmtPassDD({ ...pass, dismountCode: "" }, lookup(1, 1), rule).status, "unknown");
    const missing = checkDmtPassDD(pass, [], rule);
    assert.equal(missing.status, "unknown");
    assert.match(missing.message, /first, second/);
});
