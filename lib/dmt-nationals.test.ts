import assert from "node:assert/strict";
import test from "node:test";
import { dmtNationalsRounds, dmtWagcRounds } from "./dmt-nationals";
import { emptyDmtSet } from "./dmt-sets";
import { nationalsRequirement } from "./nationals";
import type { QualificationRequirement } from "./mobility";

test("DMT Nationals combines two passes per round without mixing rounds or sets", () => {
    const set = emptyDmtSet("Level 5");
    set.passes = set.passes.map((pass) => ({ ...pass, firstCode: "a", dismountCode: pass.passNumber < 3 ? "b" : "c" }));
    const lookup = [{ fig_code: "a", difficulty: 1.2 }, { fig_code: "b", difficulty: 1.5 }, { fig_code: "c", difficulty: 2 }];
    assert.deepEqual(dmtNationalsRounds([set, set], lookup).map((round) => round.difficulty), [5.4, 6.4, 5.4, 6.4]);
    set.passes[0].firstCode = "unknown";
    assert.equal(dmtNationalsRounds([set], lookup)[0].difficulty, null);
    set.passes[0].firstCode = "";
    assert.equal(dmtNationalsRounds([set], lookup)[0].difficulty, null);
});

test("DMT qualification matches database level, gender and year independently of TRI", () => {
    const level = { id: 23, name: "Level 6", discipline: "DMT", min_age: 17, max_age: null };
    const rule: QualificationRequirement = { id: 35, qualification_type: "nationals", discipline: "DMT", target_level_id: 23, source_level_id: null, gender: "Women", min_age: null, max_age: null, minimum_score: 43.8, minimum_dd: 7, score_basis: "any_round", pathway_name: null, description: null, required_skill: null, ruleset_year: 2027 };
    assert.equal(nationalsRequirement([rule], level, "Female", 2027), rule);
    assert.equal(nationalsRequirement([rule], level, "Male", 2027), undefined);
    assert.equal(nationalsRequirement([rule], level, "Female", 2026), undefined);
    assert.equal(nationalsRequirement([{ ...rule, discipline: "TRI" }], level, "Female", 2027), undefined);
});

test("DMT WAGC excludes finals and mount bonuses", () => {
    const set = emptyDmtSet("Level 5");
    set.passes = set.passes.map((pass) => ({ ...pass, firstCode: "41o", dismountCode: pass.passNumber <= 2 ? "4-o" : "8--o" }));
    const rounds = dmtWagcRounds([set], [{ fig_code: "41o", difficulty: 0.5 }, { fig_code: "4-o", difficulty: 0.5 }, { fig_code: "8--o", difficulty: 3 }]);
    assert.equal(rounds.length, 1);
    assert.equal(rounds[0].difficulty, 2);
    assert.match(rounds[0].name, /Preliminary/);
});
