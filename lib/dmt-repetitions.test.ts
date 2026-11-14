import assert from "node:assert/strict";
import test from "node:test";
import { dmtRepetitions, dmtRepetitionRule } from "./dmt-repetitions";
import { emptyDmtSet } from "./dmt-sets";

test("detects same skill and same placement across passes", () => {
    const set = emptyDmtSet();
    set.passes[0].firstCode = "43";
    set.passes[1].firstCode = " 43 ";
    const result = dmtRepetitions(set);
    assert.equal(result.length, 1);
    assert.equal(result[0].code, "43");
    assert(result[0].samePlacement);
    assert.deepEqual(result[0].occurrences, [{ passNumber: 1, placement: "mount" }, { passNumber: 2, placement: "mount" }]);
});

test("reports changed placements separately from same-placement repeats", () => {
    const set = emptyDmtSet();
    set.passes[0].firstCode = "43";
    set.passes[1].firstCode = "43";
    set.passes[1].firstPlacement = "spotter";
    assert(!dmtRepetitions(set)[0].samePlacement);
    set.passes[1].firstCode = "";
    set.passes[1].dismountCode = "43";
    assert.equal(dmtRepetitions(set)[0].occurrences[1].placement, "dismount");
});

test("checks dismount repetitions and reports each code once", () => {
    const set = emptyDmtSet();
    for (const pass of set.passes) { pass.firstCode = "43"; pass.dismountCode = "8--o"; }
    assert.deepEqual(dmtRepetitions(set).map((repeat) => repeat.code), ["43", "8--o"]);
    assert(dmtRepetitions(set)[1].samePlacement);
});

test("within-pass repeats follow the same placement rules", () => {
    const set = emptyDmtSet();
    set.passes[0].firstCode = "43";
    set.passes[0].dismountCode = "43";
    assert.equal(dmtRepetitions(set, "Level 5")[0].violation, false);
    assert.equal(dmtRepetitions(set, "Level 6")[0].violation, true);
});

test("ignores empty fields and keeps distinct FIG notation distinct", () => {
    const set = emptyDmtSet();
    assert.deepEqual(dmtRepetitions(set), []);
    set.passes[0].firstCode = "43";
    set.passes[1].firstCode = ".43";
    assert.deepEqual(dmtRepetitions(set), []);
});

test("uses zone rules for Levels 1–5/Novice and WGYM for advanced levels", () => {
    for (const level of ["Level 1", "Level 2", "Level 3", "Level 4", "Novice", "Level 5", "Novice / Level 5"]) assert.equal(dmtRepetitionRule(level), "zone");
    for (const level of ["Level 6", "Junior", "Senior"]) assert.equal(dmtRepetitionRule(level), "wgym");
    const set = emptyDmtSet();
    set.passes[0].firstCode = "43";
    set.passes[1].firstCode = "43";
    for (const level of ["Level 1", "Novice", "Level 5", "Level 6", "Junior", "Senior"]) assert.equal(dmtRepetitions(set, level)[0].violation, true);
    set.passes[1].firstPlacement = "spotter";
    assert.equal(dmtRepetitions(set, "Level 5")[0].violation, false);
    assert.equal(dmtRepetitions(set, "Senior")[0].violation, true);
    assert.equal(dmtRepetitions(set, null)[0].violation, null);
});
