import { dmtJuniorMountBonus } from "./dmt-specials";
import assert from "node:assert/strict";
import test from "node:test";
import { checkDmtSpecials, checkDmtSetSpecials, dmtMountBonus } from "./dmt-specials";
import { emptyDmtSet } from "./dmt-sets";

const pass = { ...emptyDmtSet().passes[0], firstCode: "a", dismountCode: "b" };
const lookup = (a: number, b: number) => [{ fig_code: "a", difficulty: a }, { fig_code: "b", difficulty: b }];

test("requires one individual element worth 0.50+, not just a pass total of 0.50+", () => {
    assert.equal(checkDmtSpecials(pass, "Level 1", lookup(0.3, 0.3))[1].status, "unmet");
    assert.equal(checkDmtSpecials(pass, "Level 1", lookup(0.5, 0.1))[1].status, "met");
    assert.equal(checkDmtSpecials(pass, "Level 1", lookup(0.1, 0.5))[1].status, "met");
});

test("checks two elements and handles incomplete or unmatched codes", () => {
    assert.equal(checkDmtSpecials(pass, "Level 1", lookup(0.5, 0.1))[0].status, "met");
    const incomplete = checkDmtSpecials({ ...pass, dismountCode: "" }, "Level 1", lookup(0.1, 0.1));
    assert(incomplete.every((check) => check.status === "unknown"));
    assert.equal(checkDmtSpecials(pass, "Level 1", [lookup(0.1, 0.1)[0]])[1].status, "unknown");
    assert.equal(checkDmtSpecials(pass, "Level 1", [lookup(0.5, 0.1)[0]])[1].status, "met");
});



test("checks every pass independently and accepts either first-skill placement", () => {
    const set = emptyDmtSet("Level 1");
    set.passes = set.passes.map((row, index) => ({ ...row, firstCode: index === 3 ? "low" : "a", dismountCode: "b", firstPlacement: "spotter" }));
    const table = [...lookup(0.5, 0.1), { fig_code: "low", difficulty: 0.1 }];
    assert.deepEqual(set.passes.map((row) => checkDmtSpecials(row, "Level 1", table)[1].status), ["met", "met", "met", "unmet"]);
});

test("Level 2 requires a 0.70+ individual element in every pass", () => {
    assert.equal(checkDmtSpecials(pass, "Level 2", lookup(0.6, 0.6))[1].status, "unmet");
    assert.equal(checkDmtSpecials(pass, "Level 2", lookup(0.7, 0.1))[1].status, "met");
    assert.equal(checkDmtSpecials(pass, "Level 2", lookup(0.1, 0.7))[1].status, "met");
});

test("requires a two-salto pass separately in passes 1–2 and 3–4", () => {
    const set = emptyDmtSet("Level 2");
    set.passes = set.passes.map((row) => ({ ...row, firstCode: "--o", dismountCode: "43" }));
    set.passes[1].firstCode = ".41o";
    assert.deepEqual(checkDmtSetSpecials(set, "Level 2").map((check) => check.status), ["met", "unmet"]);
    set.passes[3].firstCode = "41/";
    assert(checkDmtSetSpecials(set, "Level 2").every((check) => check.status === "met"));
    set.passes[1].dismountCode = "";
    assert.equal(checkDmtSetSpecials(set, "Level 2")[0].status, "unknown");
    assert.deepEqual(checkDmtSetSpecials(set, "Level 1"), []);
});

test("mount bonus counts distinct 41 shapes once per set and excludes other zones", () => {
    const set = emptyDmtSet("Level 2");
    for (const [index, code] of ["41o", "41<", "41/", ".41o"].entries()) set.passes[index].firstCode = code;
    assert.deepEqual(dmtMountBonus(set, "Level 2"), { total: 1.5, codes: ["41o", "41<", "41/"] });
    set.passes[2].firstPlacement = "spotter";
    set.passes[2].dismountCode = "41/";
    assert.equal(dmtMountBonus(set, "Level 2").total, 1);
    assert.equal(dmtMountBonus(set, "Level 1").total, 0);
});

test("Level 3 accepts two 4-prefix skills or a -prefix first skill with an 8-prefix dismount", () => {
    for (const firstPlacement of ["mount", "spotter"] as const) {
        for (const [firstCode, dismountCode] of [["41o", "43"], [".4-o", ".44"], ["--o", "8--o"], ["-2", ".8-1o"]]) {
            assert.equal(checkDmtSpecials({ ...pass, firstPlacement, firstCode, dismountCode }, "Level 3", [])[1].status, "met");
        }
        for (const [firstCode, dismountCode] of [["--o", "43"], ["4-o", "8--o"], ["8--o", "4-o"], ["3-o", "8--o"]]) {
            assert.equal(checkDmtSpecials({ ...pass, firstPlacement, firstCode, dismountCode }, "Level 3", [])[1].status, "unmet");
        }
    }
    assert.equal(checkDmtSpecials({ ...pass, firstCode: "" }, "Level 3", [])[1].status, "unknown");
});

test("Level 3 requires a 0.90+ element once per pass pair, not in every pass", () => {
    const set = emptyDmtSet("Level 3");
    set.passes = set.passes.map((row) => ({ ...row, firstCode: "4-low", dismountCode: "4-low" }));
    const table = [{ fig_code: "4-low", difficulty: 0.5 }, { fig_code: "4-high", difficulty: 0.9 }];
    set.passes[1].dismountCode = "4-high";
    assert.deepEqual(checkDmtSetSpecials(set, "Level 3", table).map((check) => check.status), ["met", "unmet"]);
    set.passes[2].firstCode = "4-high";
    assert(checkDmtSetSpecials(set, "Level 3", table).every((check) => check.status === "met"));
    set.passes[2].firstCode = "missing";
    assert.equal(checkDmtSetSpecials(set, "Level 3", table)[1].status, "unknown");
    assert.equal(dmtMountBonus(set, "Level 3").total, 0);
});

test("Level 4 uses the same special requirements as Level 3", () => {
    const set = emptyDmtSet("Level 4");
    const table = [{ fig_code: "4-low", difficulty: 0.5 }, { fig_code: "4-high", difficulty: 0.9 }];
    set.passes = set.passes.map((row) => ({ ...row, firstCode: "4-high", dismountCode: "4-low" }));
    for (const row of set.passes) assert.deepEqual(checkDmtSpecials(row, "Level 4", table), checkDmtSpecials(row, "Level 3", table));
    assert.deepEqual(checkDmtSetSpecials(set, "Level 4", table), checkDmtSetSpecials(set, "Level 3", table));
    const invalid = { ...set.passes[0], firstCode: "--o", dismountCode: "4-low" };
    assert.equal(checkDmtSpecials(invalid, "Level 4", table)[1].status, "unmet");
    assert.equal(dmtMountBonus(set, "Level 4").total, 0);
});

test("Novice and Level 5 require a 2.00+ element in prelims only", () => {
    const set = emptyDmtSet("Level 5");
    const table = [{ fig_code: "8-low", difficulty: 1.2 }, { fig_code: "8-high", difficulty: 2 }];
    set.passes = set.passes.map((row) => ({ ...row, firstCode: "8-low", dismountCode: "8-low" }));
    for (const level of ["Novice", "Level 5"]) {
        assert.equal(checkDmtSetSpecials(set, level, table)[0].status, "unmet");
        set.passes[3].dismountCode = "8-high";
        assert.equal(checkDmtSetSpecials(set, level, table)[0].status, "unmet");
        set.passes[1].firstCode = "8-high";
        assert.equal(checkDmtSetSpecials(set, level, table)[0].status, "met");
        set.passes[1].firstCode = "8-low";
    }
});

test("each final pass independently needs a 1.20+ individual element", () => {
    const table = [{ fig_code: "4-low", difficulty: 0.6 }, { fig_code: "8-high", difficulty: 1.2 }];
    for (const level of ["Novice", "Level 5"]) {
        for (const passNumber of [3, 4]) {
            const finalPass = { ...pass, passNumber, firstCode: "4-low", dismountCode: "4-low" };
            assert.equal(checkDmtSpecials(finalPass, level, table)[2].status, "unmet");
            assert.equal(checkDmtSpecials({ ...finalPass, dismountCode: "8-high" }, level, table)[2].status, "met");
            assert.equal(checkDmtSpecials({ ...finalPass, dismountCode: "missing" }, level, table)[2].status, "unknown");
        }
        assert.equal(checkDmtSpecials({ ...pass, passNumber: 1, firstCode: "4-low", dismountCode: "4-low" }, level, table).length, 2);
    }
});

test("all Novice/Level 5 elements need full somersaults, including finals", () => {
    for (const level of ["Novice", "Level 5"]) for (const passNumber of [1, 2, 3, 4]) {
        for (const code of ["4-o", ".43", "5-o", "7--o", "8--o", "12---o"]) {
            assert.equal(checkDmtSpecials({ ...pass, passNumber, firstCode: code, dismountCode: "8--o" }, level, [])[1].status, "met");
        }
        for (const code of ["--o", "-2", "3-o", "1-F"]) {
            const result = checkDmtSpecials({ ...pass, passNumber, firstCode: "8--o", dismountCode: code }, level, [])[1];
            assert.equal(result.status, "unmet");
            assert.match(result.message, /Interruption/);
        }
    }
});

test("Junior requires a double in each pass and full somersaults in both elements", () => {
    for (const passNumber of [1, 2]) {
        for (const firstPlacement of ["mount", "spotter"] as const) {
            const valid = { ...pass, passNumber, firstPlacement, firstCode: "4-o", dismountCode: ".8--o" };
            assert(checkDmtSpecials(valid, "Junior", []).every((check) => check.status === "met"));
            assert.equal(checkDmtSpecials({ ...valid, dismountCode: "4-o" }, "Junior", [])[2].status, "unmet");
            assert.equal(checkDmtSpecials({ ...valid, firstCode: "--o" }, "Junior", [])[1].status, "unmet");
            assert.equal(checkDmtSpecials({ ...valid, dismountCode: "" }, "Junior", [])[2].status, "unknown");
        }
    }
});

test("Junior women's 8-1< mount bonus applies independently to each pass", () => {
    for (const passNumber of [1, 2]) {
        const row = { ...pass, passNumber, firstPlacement: "mount" as const, firstCode: ".8-1<", dismountCode: "8-1<" };
        assert.equal(dmtJuniorMountBonus(row, "Junior", "Female"), 0.5);
        assert.equal(dmtJuniorMountBonus(row, "Junior", "Women"), 0.5);
        assert.equal(dmtJuniorMountBonus(row, "Junior", "Male"), 0);
        assert.equal(dmtJuniorMountBonus(row, "Junior", null), 0);
        assert.equal(dmtJuniorMountBonus({ ...row, firstPlacement: "spotter" }, "Junior", "Female"), 0);
        assert.equal(dmtJuniorMountBonus({ ...row, firstCode: "8-1o" }, "Junior", "Female"), 0);
        assert.equal(dmtJuniorMountBonus(row, "Level 5", "Female"), 0);
    }
});

test("Junior set requires four unique elements regardless of placement", () => {
    const set = emptyDmtSet("Junior");
    set.passes[0] = { ...set.passes[0], firstCode: "8--o", dismountCode: "4-o" };
    set.passes[1] = { ...set.passes[1], firstCode: "8-1<", dismountCode: "4-/" };
    assert.equal(checkDmtSetSpecials(set, "Junior")[0].status, "met");
    for (const firstPlacement of ["mount", "spotter"] as const) {
        set.passes[1].firstPlacement = firstPlacement;
        set.passes[1].firstCode = "4-o";
        assert.equal(checkDmtSetSpecials(set, "Junior")[0].status, "unmet");
    }
    set.passes[1].firstCode = "8-1<";
    set.passes[0].dismountCode = "8--o";
    assert.equal(checkDmtSetSpecials(set, "Junior")[0].status, "unmet");
    set.passes[0].dismountCode = "";
    assert.equal(checkDmtSetSpecials(set, "Junior")[0].status, "unknown");
});

test("Level 6 shares Junior pass and uniqueness requirements without a bonus", () => {
    const set = emptyDmtSet("Level 6");
    set.passes[0] = { ...set.passes[0], firstCode: "8-1<", dismountCode: "4-o" };
    set.passes[1] = { ...set.passes[1], firstCode: "8--o", dismountCode: "4-/" };
    for (const pass of set.passes) {
        assert.deepEqual(checkDmtSpecials(pass, "Level 6", []), checkDmtSpecials(pass, "Junior", []));
        assert(checkDmtSpecials(pass, "Level 6", []).every((check) => check.status === "met"));
        assert.equal(dmtJuniorMountBonus(pass, "Level 6", "Female"), 0);
    }
    assert.equal(checkDmtSetSpecials(set, "Level 6")[0].status, "met");
    set.passes[1].firstCode = "4-o";
    assert.equal(checkDmtSetSpecials(set, "Level 6")[0].status, "unmet");
    assert.equal(checkDmtSpecials(set.passes[1], "Level 6", [])[2].status, "unmet");
    set.passes[1].firstCode = "--o";
    assert.match(checkDmtSpecials(set.passes[1], "Level 6", [])[1].message, /Interruption/);
});

test("Senior needs full somersaults and four unique elements, but no double or bonus", () => {
    const set = emptyDmtSet("Senior");
    set.passes[0] = { ...set.passes[0], firstCode: "4-o", dismountCode: "4-/" };
    set.passes[1] = { ...set.passes[1], firstCode: "4-<", dismountCode: "43" };
    for (const pass of set.passes) {
        const checks = checkDmtSpecials(pass, "Senior", []);
        assert.equal(checks.length, 2);
        assert(checks.every((check) => check.status === "met"));
        assert.equal(dmtJuniorMountBonus({ ...pass, firstCode: "8-1<" }, "Senior", "Female"), 0);
    }
    assert.equal(checkDmtSetSpecials(set, "Senior")[0].status, "met");
    set.passes[1].firstCode = "4-o";
    assert.equal(checkDmtSetSpecials(set, "Senior")[0].status, "unmet");
    set.passes[1].firstCode = "3-o";
    assert.match(checkDmtSpecials(set.passes[1], "Senior", [])[1].message, /Interruption/);
    set.passes[1].firstCode = "";
    assert.equal(checkDmtSpecials(set.passes[1], "Senior", [])[0].status, "unknown");
    assert.equal(checkDmtSetSpecials(set, "Senior")[0].status, "unknown");
});
