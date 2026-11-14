import assert from "node:assert/strict";
import test from "node:test";
import { competesInEvent, DMT_LEVELS, SYN_LEVELS, eventPayload, eventValidation, type AthleteEvents } from "./athlete-events";

const base: AthleteEvents = { dmtLevel: "Level 2", synLevel: "Level 3", partnerType: "club", partnerId: "8", externalPartnerId: "", externalName: "", externalClub: "" };

test("has the requested event levels", () => {
    assert.deepEqual(DMT_LEVELS, ["Level 1", "Level 2", "Level 3", "Level 4", "Novice", "Level 5", "Level 6", "Junior", "Senior"]);
    assert.deepEqual(SYN_LEVELS, ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Senior"]);
});

test("no participation is null, blank, or an explicit doesn't-compete value", () => {
    for (const value of [null, undefined, "", " ", "Doesn’t compete", "Doesn't compete in this event"]) assert(!competesInEvent(value));
    assert(competesInEvent("Level 1"));
});

test("club and external partners use mutually exclusive foreign keys", () => {
    assert.deepEqual(eventPayload(base), { dmt_level: "Level 2", syn_level: "Level 3", synchro_partner_id: 8, external_synchro_partner_id: null });
    assert.deepEqual(eventPayload({ ...base, partnerType: "external", externalPartnerId: "12" }), {
        dmt_level: "Level 2", syn_level: "Level 3", synchro_partner_id: null, external_synchro_partner_id: 12,
    });
});

test("opting out clears the event and partner, without requiring a partner", () => {
    const disabled = { ...base, dmtLevel: "", synLevel: "" };
    assert.deepEqual(eventPayload(disabled), { dmt_level: null, syn_level: null, synchro_partner_id: null, external_synchro_partner_id: null });
    assert.equal(eventValidation(disabled, 8), null);
});

test("external-column migration is optional for existing event/club-partner saves", () => {
    assert(!Object.hasOwn(eventPayload(base, false), "external_synchro_partner_id"));
});

test("rejects self-partners, missing club partners, and blank external names", () => {
    assert(eventValidation(base, 8));
    assert(eventValidation({ ...base, partnerId: "" }, 7));
    assert(eventValidation({ ...base, partnerType: "external", externalPartnerId: "new", externalName: " " }, 7));
    assert.equal(eventValidation(base, 7), null);
    assert.equal(eventValidation({ ...base, partnerType: "none", partnerId: "" }, 7), null);
});
