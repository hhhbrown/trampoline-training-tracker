import assert from "node:assert/strict";
import test from "node:test";
import { nationalTeamRules, supportsNationalTeam, nationalTeamCategoryEligible, nationalTeamEntryNote } from "./national-team";
import type { QualificationRequirement } from "./mobility";
const base: QualificationRequirement = { id: 45, qualification_type: "international", source_level_id: null, target_level_id: null, gender: "Women", min_age: 13, max_age: 16, minimum_score: 89.6, minimum_dd: 10.5, score_basis: "same_routine", pathway_name: "National Team - Junior", description: null, required_skill: null, ruleset_year: 2026, discipline: "TRI" };
const rules = [base, { ...base, id: 47, pathway_name: "National Team - Development", min_age: 17, max_age: 21 }, { ...base, id: 49, pathway_name: "National Team - Senior", min_age: 17, max_age: null }];
test("ranking section is limited to Junior, Level 7 and Senior", () => {
    for (const level of ["Junior", "Level 7", "Senior"]) assert(supportsNationalTeam(level));
    for (const level of [null, "Novice", "Level 5", "Level 6"]) assert(!supportsNationalTeam(level));
    assert(nationalTeamCategoryEligible("National Team - Junior", "Junior"));
    assert(!nationalTeamCategoryEligible("National Team - Junior", "Senior"));
});
test("database age ranges select Junior, overlapping Development/Senior and Senior only", () => {
    assert.deepEqual(nationalTeamRules(rules, "TRI", "Female", "2014-12-31", 2027).map((r) => r.id), [45]);
    assert.deepEqual(nationalTeamRules(rules, "TRI", "Female", "2010-01-01", 2027).map((r) => r.id), [47,49]);
    assert.deepEqual(nationalTeamRules(rules, "TRI", "Female", "2005-01-01", 2027).map((r) => r.id), [49]);
    assert.deepEqual(nationalTeamRules(rules, "TRI", "Female", "2015-01-01", 2027), []);
});
test("isolates discipline, gender, ruleset and pathway", () => {
    for (const changed of [{...base, discipline:"DMT"}, {...base, ruleset_year:2027}, {...base, pathway_name:"WAGC"}, {...base, qualification_type:"nationals"}, {...base, gender:"Men"}]) {
        assert.deepEqual(nationalTeamRules([changed], "TRI", "Female", "2013-01-01", 2027), []);
    }
    assert.equal(nationalTeamRules([{...base, discipline:"TRS"}], "TRS", "Female", "2013-01-01", 2027).length, 1);
});
test("entry notes preserve the conditional age-out and carry-forward pathways", () => {
    assert.match(nationalTeamEntryNote("National Team - Senior", "Level 7"), /prior Senior mobility and coach notification/);
    assert.match(nationalTeamEntryNote("National Team - Development", "Junior"), /January 1/);
    assert.match(nationalTeamEntryNote("National Team - Junior", "Junior"), /Novice scores/);
});

test("DMT ranking categories include Level 6 and exclude Level 7", () => {
    for (const level of ["Junior", "Level 6", "Senior"]) assert(supportsNationalTeam(level, "DMT"));
    for (const level of ["Level 5", "Novice", "Level 7", null]) assert(!supportsNationalTeam(level, "DMT"));
    assert(!supportsNationalTeam("Level 6", "TRI"));
});

test("DMT National Team standards use database gender, discipline and age ranges", () => {
    const dmtRules = rules.map((rule) => ({ ...rule, discipline: "DMT", score_basis: "national_team_ranking" }));
    assert.deepEqual(nationalTeamRules(dmtRules, "DMT", "Female", "2013-12-31", 2027).map((r) => r.id), [45]);
    assert.deepEqual(nationalTeamRules(dmtRules, "DMT", "Female", "2010-12-31", 2027).map((r) => r.id), [47,49]);
    assert.deepEqual(nationalTeamRules(dmtRules, "DMT", "Female", "2005-12-31", 2027).map((r) => r.id), [49]);
    assert.deepEqual(nationalTeamRules(dmtRules, "DMT", "Male", "2013-12-31", 2027), []);
    assert.deepEqual(nationalTeamRules(dmtRules, "TRI", "Female", "2013-12-31", 2027), []);
});
