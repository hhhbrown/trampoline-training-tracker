import assert from "node:assert/strict";
import test from "node:test";
import { calculateDD } from "./dd";

const lookup = [
    { fig_code: ".4-1o", difficulty: "0.60" },
    { fig_code: "8--<", difficulty: 1.3 },
    { fig_code: "--o", difficulty: 0.1 },
    { fig_code: "--L", difficulty: 0.1 },
];

test("accepts commas, newlines, CRLF, whitespace and empty separators", () => {
    assert.deepEqual(calculateDD(" .4-1o, 8--<\r\n --o,\n", lookup), {
        total: 2, unmatched: [], repeated: [],
    });
});

test("ignores leading periods for lookup but retains them for uniqueness", () => {
    assert.deepEqual(calculateDD(".4-1o,4-1o,..4-1o", lookup), {
        total: 1.8, unmatched: [], repeated: [],
    });
    assert.deepEqual(calculateDD(".4-1o, .4-1o, 4-1o", lookup), {
        total: 1.8, unmatched: [], repeated: [".4-1o"],
    });
});

test("normalizes leading periods on the lookup side too", () => {
    assert.equal(calculateDD(".8--<", lookup).total, 1.3);
});

test("reports unmatched skills and repeats while summing every matched occurrence", () => {
    assert.deepEqual(calculateDD("--o,unknown,unknown,--o", lookup), {
        total: 0.2, unmatched: ["unknown"], repeated: ["unknown", "--o"],
    });
});

test("preserves case and internal notation", () => {
    assert.deepEqual(calculateDD("--L,--l,8 --<", lookup), {
        total: 0.1, unmatched: ["--l", "8 --<"], repeated: [],
    });
});

test("sums decimal difficulty without floating-point drift", () => {
    assert.equal(calculateDD(Array(10).fill("--o").join(","), lookup).total, 1);
});

test("empty routines have no DD; entirely unmatched routines have a flagged subtotal", () => {
    assert.deepEqual(calculateDD(" ,\n ", lookup), { total: null, unmatched: [], repeated: [] });
    assert.deepEqual(calculateDD("missing", lookup), { total: 0, unmatched: ["missing"], repeated: [] });
});
