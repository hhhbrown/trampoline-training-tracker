import assert from "node:assert/strict";
import test from "node:test";
import { dmtPrintLines } from "./dmt-print";
import { emptyDmtSet } from "./dmt-sets";
const lookup = [{ fig_code: "4-o", difficulty: 0.5 }, { fig_code: "8--o", difficulty: 1.1 }];
function filled(level = "Level 4") {
    const set = emptyDmtSet(level);
    set.passes = set.passes.map((pass) => ({ ...pass, firstCode: "4-o", dismountCode: "8--o" }));
    return set;
}
test("prints first set only, with both skills on each of four lines", () => {
    const first = filled();
    first.passes[0].firstPlacement = "spotter";
    const second = filled();
    second.passes[0].firstCode = "not-printed";
    const lines = dmtPrintLines([first, second], lookup);
    assert.equal(lines.length, 4);
    assert.equal(lines[0], "Spotter: 4-o → Dismount: 8--o · DD: 1.60");
    assert(lines.every((line) => !line.includes("\n") && !line.includes("not-printed")));
});
test("two-pass sets leave final two lines blank; no sets leaves four blank lines", () => {
    assert.deepEqual(dmtPrintLines([filled("Junior")], lookup).slice(2), ["", ""]);
    assert.deepEqual(dmtPrintLines([], lookup), ["", "", "", ""]);
});
test("does not substitute a later set for an empty first set", () => {
    assert.match(dmtPrintLines([emptyDmtSet("Level 4"), filled()], lookup)[0], /Mount: — → Dismount: — · DD: incomplete/);
});
test("preserves DD warnings", () => {
    const set = filled();
    set.passes[0].dismountCode = "unknown";
    assert.match(dmtPrintLines([set], lookup)[0], /DD: unmatched skill/);
    assert.match(dmtPrintLines([set], lookup, "error")[1], /DD: unavailable/);
});
