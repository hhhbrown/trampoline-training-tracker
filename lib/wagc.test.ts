import assert from "node:assert/strict";
import test from "node:test";
import { competitionAge } from "./competition-age";
import { supportsWagc, wagcAgeGroup, wagcCategoryEligible, wagcRules, WAGC_AGE_CUTOFF_YEAR, WAGC_RULESET_YEAR } from "./wagc";
import type { QualificationRequirement } from "./mobility";

const base: QualificationRequirement = {
    id: 1, qualification_type: "international", source_level_id: null, target_level_id: null,
    gender: "Women", min_age: 13, max_age: 14, minimum_score: 86.6, minimum_dd: 9,
    score_basis: "best_compulsory_plus_optional", pathway_name: "2026 WAGC TRI",
    description: null, required_skill: null, ruleset_year: 2026,
};
const rules = [[11, 12], [13, 14], [15, 16], [17, 21]].map(([min_age, max_age], id) => ({ ...base, id, min_age, max_age }));

test("shows WAGC only for Level 5 and higher, including Novice", () => {
    for (const level of ["Novice", "Level 5", "Junior", "Level 6", "Level 7", "Senior"]) assert(supportsWagc(level));
    for (const level of [null, "", "Level 1", "Level 2", "Level 3", "Level 4", "Unknown", "Novice / Level 5"]) assert(!supportsWagc(level));
    // Showing the section does not override the supplied category eligibility rules.
    assert(!wagcCategoryEligible("Level 5", 15));
    assert(!wagcCategoryEligible("Level 6", 17));
});

test("uses the 2027 age cutoff while retaining 2026 rules", () => {
    assert.equal(WAGC_RULESET_YEAR, 2026);
    assert.equal(WAGC_AGE_CUTOFF_YEAR, 2027);
    assert.equal(competitionAge("2013-12-31", WAGC_AGE_CUTOFF_YEAR), 14);
    assert.equal(wagcAgeGroup(rules, "2012-12-31", "Female")?.min_age, 15);
    assert.equal(wagcAgeGroup(rules, "2013-12-31", "Female")?.min_age, 13);
});

test("matches all age-group boundaries, without accepting underage or overage athletes", () => {
    for (const [age, minimum] of [[11, 11], [12, 11], [13, 13], [14, 13], [15, 15], [16, 15], [17, 17], [21, 17]]) {
        assert.equal(wagcAgeGroup(rules, `${WAGC_AGE_CUTOFF_YEAR - age}-12-31`, "Female")?.min_age, minimum);
    }
    assert.equal(wagcAgeGroup(rules, "2017-01-01", "Female"), undefined);
    assert.equal(wagcAgeGroup(rules, "2005-01-01", "Female"), undefined);
    assert.equal(wagcAgeGroup(rules, null, "Female"), undefined);
});

test("isolates WAGC TRI, gender, qualification type and ruleset year", () => {
    assert.equal(wagcRules([base], "Female").length, 1);
    assert.equal(wagcRules([base], "Male").length, 0);
    assert.equal(wagcRules([base], null).length, 0);
    for (const altered of [{ ...base, ruleset_year: 2027 }, { ...base, pathway_name: "2026 WAGC TRS" }, { ...base, qualification_type: "mobility" }]) {
        assert.equal(wagcRules([altered], "Female").length, 0);
    }
});

test("checks eligible regular competition categories", () => {
    for (const age of [11, 12, 13, 14]) assert(wagcCategoryEligible("Novice", age));
    for (const age of [13, 16]) assert(wagcCategoryEligible("Junior", age));
    for (const level of ["Level 7", "Senior"]) for (const age of [17, 21]) assert(wagcCategoryEligible(level, age));
    for (const [level, age] of [["Level 4", 13], ["Level 5", 15], ["Level 6", 18], ["Junior", 12], ["Senior", 16], ["Novice", 15]] as const) {
        assert(!wagcCategoryEligible(level, age));
    }
});

test("DMT WAGC uses explicit discipline and the 2027 age cutoff with 2026 rules", () => {
    const dmt = { ...base, discipline: "DMT", pathway_name: "WAGC", min_age: 13, max_age: 14, ruleset_year: 2026 };
    assert.equal(wagcAgeGroup([dmt], "2013-12-31", dmt.gender, "DMT"), dmt);
    assert.equal(wagcAgeGroup([dmt], "2013-12-31", dmt.gender), undefined);
    assert.equal(wagcAgeGroup([{ ...dmt, ruleset_year: 2027 }], "2013-12-31", dmt.gender, "DMT"), undefined);
    assert.equal(wagcAgeGroup([dmt], "2012-01-01", dmt.gender, "DMT"), undefined);
});
