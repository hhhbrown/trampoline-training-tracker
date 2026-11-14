import assert from "node:assert/strict";
import test from "node:test";
import { sharedSynchroAthleteIds, synchroDraft, synchroDifficulty, synchroPayload } from "./synchro-routines";

const lookup = [{ fig_code: "8--o", difficulty: 1.1 }];

test("both profiles resolve to the same internal pair scope", () => {
    assert.deepEqual(sharedSynchroAthleteIds({ id: 9 }, { partner: { id: 20 }, conflict: false }), [9, 20]);
    assert.deepEqual(sharedSynchroAthleteIds({ id: 20 }, { partner: { id: 9 }, conflict: false }), [9, 20]);
});

test("external, unpaired and conflicting relationships keep athlete-specific routines", () => {
    assert.deepEqual(sharedSynchroAthleteIds({ id: 20, external_synchro_partner_id: 4 }, { partner: { id: 9 }, conflict: false }), [20]);
    assert.deepEqual(sharedSynchroAthleteIds({ id: 20 }, { partner: null, conflict: false }), [20]);
    assert.deepEqual(sharedSynchroAthleteIds({ id: 20 }, { partner: { id: 9 }, conflict: true }), [20]);
});

test("editing a shared routine preserves its original athlete and manual difficulty", () => {
    const draft = synchroDraft({ id: 3, athlete_id: 9, routine_name: "Pair routine", skills: ["8--o"], difficulty: 2, notes: "Pair notes" }, lookup);
    assert.equal(draft.athleteId, 9);
    assert.equal(synchroDifficulty(draft, lookup), "2");
    const payload = synchroPayload(draft, draft.athleteId!, lookup);
    assert.equal(payload.athlete_id, 9);
    assert.deepEqual(payload.skills, ["8--o"]);
    assert.equal(payload.difficulty, 2);
    assert.equal(payload.notes, "Pair notes");
});

test("new routines use the same deterministic owner from either profile", () => {
    const left = sharedSynchroAthleteIds({ id: 9 }, { partner: { id: 20 }, conflict: false });
    const right = sharedSynchroAthleteIds({ id: 20 }, { partner: { id: 9 }, conflict: false });
    const draft = { ...synchroDraft(null, lookup), skills: "8--o,8--o" };
    assert.equal(synchroPayload(draft, Math.min(...left), lookup).athlete_id, 9);
    assert.equal(synchroPayload(draft, Math.min(...right), lookup).athlete_id, 9);
    assert.equal(synchroPayload(draft, 9, lookup).difficulty, 2.2);
});
