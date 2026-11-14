import assert from "node:assert/strict";
import test from "node:test";
import { assessDD } from "./competition-dd";
import { synDDCheck } from "./syn-requirements";

const rule = { level_id: 1, gender: null, min_dd: 4, max_dd: 6 };
test("Levels 1–4 warn without penalties", () => {
    for (const level of ["Level 1", "Level 2", "Level 3", "Level 4"]) {
        assert.equal(assessDD(2, rule, level).status, "warning");
        assert.equal(assessDD(2, rule, level).penalty, 0);
        assert.equal(synDDCheck(2, rule, level).status, "warning");
    }
});
test("advanced TRI and SYN penalties have no cap", () => {
    for (const level of ["Novice", "Level 5", "Level 6", "Level 7", "Junior", "Senior"]) {
        assert.equal(assessDD(2, rule, level).penalty, 2);
        assert.equal(synDDCheck(2, rule, level).status, "penalty");
        assert.match(synDDCheck(2, rule, level).message, /Penalty: 2.00 points/);
    }
});
