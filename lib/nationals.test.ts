import assert from "node:assert/strict";
import test from "node:test";
import { nationalsLevelExempt, nationalsRequirement, supportsNationals } from "./nationals";
import type { QualificationRequirement } from "./mobility";

const level = { id: 7, name: "Level 6", discipline: "TRI", min_age: 17, max_age: null };
const rule: QualificationRequirement = {
    id: 1, qualification_type: "nationals", target_level_id: 7, source_level_id: null,
    gender: "Women", min_age: null, max_age: null, minimum_score: 81, minimum_dd: 9.2,
    score_basis: "compulsory_plus_optional", pathway_name: "Canadian Championships",
    description: null, required_skill: null, ruleset_year: 2027, discipline: "TRI",
};

test("only Novice, Junior and Senior receive the high-performance exemption", () => {
    for (const name of ["Novice", "Junior", "Senior", " junior "]) assert(nationalsLevelExempt(name));
    for (const name of ["Level 4", "Level 5", "Level 6", "Level 7", null, "", "Novice / Level 5"]) assert(!nationalsLevelExempt(name));
});

test("matches target level, gender, discipline and ruleset", () => {
    assert.equal(nationalsRequirement([rule], level, "Female", 2027), rule);
    for (const changed of [{ ...rule, qualification_type: "mobility" }, { ...rule, ruleset_year: 2026 }, { ...rule, target_level_id: 8 }, { ...rule, discipline: "TRS" }]) {
        assert.equal(nationalsRequirement([changed], level, "Female", 2027), undefined);
    }
    assert.equal(nationalsRequirement([rule], level, "Male", 2027), undefined);
    assert.equal(nationalsRequirement([rule], undefined, "Female", 2027), undefined);
});

test("uses gender-neutral requirements where applicable and prefers specific rules", () => {
    const shared = { ...rule, gender: null };
    assert.equal(nationalsRequirement([shared], level, null, 2027), shared);
    assert.equal(nationalsRequirement([shared], level, "Other", 2027), shared);
    assert.equal(nationalsRequirement([shared, rule], level, "Female", 2027), rule);
});

test("Canadian Championships cards are shown only for Level 5 and above", () => {
    for (const level of ["Level 1", "Level 2", "Level 3", "Level 4", null, ""]) assert(!supportsNationals(level));
    for (const level of ["Level 5", "Level 6", "Level 7", "Novice", "Junior", "Senior"]) assert(supportsNationals(level));
});
