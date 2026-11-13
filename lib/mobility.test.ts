import assert from "node:assert/strict";
import test from "node:test";
import { matchingMobilityPaths, mobilityAgeCheck, mobilityRoutineChecks, supportsMobility, type QualificationRequirement } from "./mobility";

const rule: QualificationRequirement = {
    id: 1, qualification_type: "mobility", source_level_id: 4, target_level_id: 5,
    gender: "Women", min_age: 11, max_age: 14, minimum_score: "88.60", minimum_dd: "7.70",
    score_basis: "prelim_including_bonus", pathway_name: "Level 4 to Novice", description: null,
    required_skill: "double_salto", ruleset_year: 2027,
};
const source = { id: 4, name: "Level 4", discipline: "TRI", min_age: 8, max_age: null };
const target = { id: 5, name: "Novice", discipline: "TRI", min_age: 11, max_age: 14 };

test("matches source, discipline, gender, type and season ruleset", () => {
    const rules = [rule, { ...rule, id: 2, gender: null }];
    assert.equal(matchingMobilityPaths(rules, source, "Female", 2027).length, 2);
    assert.equal(matchingMobilityPaths(rules, source, "Male", 2027).length, 1);
    assert.equal(matchingMobilityPaths(rules, source, null, 2027).length, 1);
    assert.equal(matchingMobilityPaths(rules, source, "Other", 2027).length, 1);
    assert.equal(matchingMobilityPaths(rules, source, "Female", 2026).length, 0);
    assert.equal(matchingMobilityPaths(rules, { ...source, id: 3 }, "Female", 2027).length, 0);
    assert.equal(matchingMobilityPaths(rules, { ...source, discipline: "DMT" }, "Female", 2027).length, 0);
    assert.equal(matchingMobilityPaths([{ ...rule, qualification_type: "nationals" }], source, "Female", 2027).length, 0);
});

test("checks inclusive pathway and target ages using December 31", () => {
    for (const year of [2013, 2016]) assert.equal(mobilityAgeCheck(rule, target, `${year}-12-31`, 2027).status, "met");
    for (const year of [2012, 2017]) assert.equal(mobilityAgeCheck(rule, target, `${year}-01-01`, 2027).status, "unmet");
    assert.equal(mobilityAgeCheck(rule, target, null, 2027).status, "unknown");
    assert.equal(mobilityAgeCheck(rule, undefined, "2014-01-01", 2027).status, "unknown");
    assert.equal(mobilityAgeCheck({ ...rule, min_age: null, max_age: null }, target, "2012-01-01", 2027).status, "unmet");
});

test("age-based Junior to Level 6 needs no score or routine", () => {
    const ageBased = { ...rule, min_age: 17, max_age: null, minimum_score: null, minimum_dd: null, required_skill: null, score_basis: "age_based" };
    const level6 = { id: 6, name: "Level 6", discipline: "TRI", min_age: 17, max_age: null };
    assert.equal(mobilityAgeCheck(ageBased, level6, "2010-12-31", 2027).status, "met");
    assert.deepEqual(mobilityRoutineChecks(ageBased, { name: "Optional A", value: null, difficulty: null }), []);
});

test("checks DD and a double salto on the same routine; supports both separators and leading periods", () => {
    const checks = mobilityRoutineChecks(rule, { name: "Optional A", value: "4-o,\n .8--o", difficulty: 7.7 });
    assert(checks.every((check) => check.status === "met"));
    assert.equal(mobilityRoutineChecks(rule, { name: "Optional A", value: "8--o", difficulty: 7.69 })[0].status, "unmet");
    assert.equal(mobilityRoutineChecks(rule, { name: "Optional A", value: "4-o", difficulty: 8 })[1].status, "unmet");
    assert.equal(mobilityRoutineChecks(rule, { name: "Optional A", value: "8--o", difficulty: null })[0].status, "unknown");
    assert.equal(mobilityRoutineChecks({ ...rule, required_skill: "unknown_skill" }, { name: "Optional A", value: "8--o", difficulty: 8 })[1].status, "unknown");
});

test("shows mobility for TRI Level 4 and higher", () => {
    for (const name of ["Level 4", "Novice", "Level 5", "Junior", "Level 6", "Level 7", "Senior"]) assert(supportsMobility(name));
    for (const name of ["Level 1", "Level 3", "", "Unknown", "Novice / Level 5"]) assert(!supportsMobility(name));
});
