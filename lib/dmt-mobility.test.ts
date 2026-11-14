import assert from "node:assert/strict";
import test from "node:test";
import { dmtMobilityResults } from "./dmt-mobility";
import { emptyDmtSet } from "./dmt-sets";
import { matchingMobilityPaths, mobilityAgeCheck, futureMobilitySeason, ageAppropriateMobilityPaths, mobilityCards, type QualificationRequirement } from "./mobility";
const rule: QualificationRequirement = { id: 60, qualification_type: "mobility", discipline: "DMT", source_level_id: 20, target_level_id: 21, gender: null, min_age: null, max_age: null, minimum_score: 41.4, minimum_dd: 5.4, score_basis: "preliminary", pathway_name: null, description: null, required_skill: "double_salto", ruleset_year: 2027 };
const lookup = [{ fig_code: "4-o", difficulty: 0.6 }, { fig_code: "8--o", difficulty: 2.1 }, { fig_code: "4-high", difficulty: 2.1 }];
function filled() { const set = emptyDmtSet("Level 4"); set.passes = set.passes.map((pass) => ({...pass, firstCode:"4-o", dismountCode:"8--o"})); return set; }
test("matches DMT paths without using TRI data", () => {
    const source = { id:20, name:"Level 4", discipline:"DMT", min_age:8, max_age:null };
    assert.equal(matchingMobilityPaths([rule], source, "Female", 2027, "DMT").length, 1);
    assert.equal(matchingMobilityPaths([{...rule, discipline:"TRI"}], source, "Female", 2027, "DMT").length, 0);
    assert.equal(matchingMobilityPaths([{...rule, gender:"Men"}], source, "Female", 2027, "DMT").length, 0);
});
test("checks DD and double salto in a complete preliminary pair, ignoring finals", () => {
    const set = filled();
    const results = dmtMobilityResults(rule, [set], lookup);
    assert.equal(results.length, 1);
    assert(results[0].checks.every((check) => check.status === "met"));
    set.passes[0].dismountCode = "4-high";
    set.passes[1].dismountCode = "4-high";
    const failed = dmtMobilityResults(rule, [set], lookup)[0].checks;
    assert.equal(failed.find((check) => check.title === "Double salto")?.status, "unmet");
    assert.equal(failed.find((check) => check.title.startsWith("DD:"))?.status, "met");
});
test("preliminary-or-final permits either complete round but never combines them", () => {
    const set = filled();
    for (const pass of set.passes.slice(0,2)) pass.dismountCode="4-o";
    const results = dmtMobilityResults({...rule, score_basis:"preliminary_or_final"}, [set], lookup);
    assert.equal(results.length, 2);
    assert(results[0].checks.some((check) => check.status === "unmet"));
    assert(results[1].checks.every((check) => check.status === "met"));
});
test("unmatched and incomplete rounds cannot meet mobility requirements", () => {
    for (const code of ["", "missing"]) {
        const set = filled(); set.passes[0].firstCode = code;
        const result = dmtMobilityResults(rule, [set], lookup)[0];
        assert(result.checks.some((check) => check.status === "unknown"));
        assert(!result.checks.every((check) => check.status === "met"));
    }
    assert.equal(dmtMobilityResults({...rule, required_skill:"unrecognised"}, [filled()], lookup)[0].checks.at(-1)?.status, "unknown");
});
test("uses DMT target ages and future season; Junior age-based L6 stays automatic", () => {
    const novice = { id:21, name:"Novice", discipline:"DMT", min_age:11, max_age:15 };
    assert.equal(mobilityAgeCheck(rule, novice, "2018-01-01", 2027, "DMT").status, "unmet");
    assert.equal(futureMobilitySeason(rule, novice, "2018-01-01", 2027, "DMT")?.label, "2028/2029");
    const junior = { ...novice, id:22, name:"Junior", min_age:13, max_age:16 };
    const senior = { ...novice, id:24, name:"Senior", min_age:17, max_age:null };
    const level6 = { ...senior, id:23, name:"Level 6" };
    const paths = [{...rule, target_level_id:24}, {...rule, id:64, target_level_id:23, score_basis:"age_based"}];
    assert.deepEqual(ageAppropriateMobilityPaths(paths, junior, [senior, level6], "2012-01-01", 2027).map((path) => path.target_level_id), [24]);
    const combined = mobilityCards([{...rule,target_level_id:22}, {...rule,id:70,target_level_id:23}], {...level6,name:"Level 5"}, [junior,level6], "2010-01-01", 2027);
    assert.equal(combined.length, 1);
    assert.equal(combined[0].path.target_level_id, 23);
});
