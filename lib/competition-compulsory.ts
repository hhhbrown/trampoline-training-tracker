export function requiresAdvancedCompulsory(levelName: string) {
    const name = levelName.trim().toLowerCase();
    if (["novice", "novice / level 5", "junior", "senior"].includes(name)) return true;
    const numbered = /^level\s+(\d+)$/.exec(name);
    return numbered != null && Number(numbered[1]) >= 5;
}

export function checkCompulsory(routine: string) {
    const elements = routine.split(/[,\r\n]+/).map((element) => element.trim()).filter(Boolean);
    // Leading periods affect element identity, but not the skill's rotation code.
    const codes = elements.map((element) => element.replace(/^\.+/, ""));
    const seen = new Set<string>();
    const repeated = new Set<string>();
    for (const element of elements) {
        if (seen.has(element)) repeated.add(element);
        seen.add(element);
    }
    const somersaultCount = codes.filter((code) => /^[34578]/.test(code)).length;
    const specialRequirements = [
        { id: "landing", title: "Element landing on front or back", matches: (code: string) => /^[37]/.test(code), hint: "Code starts with 3 or 7" },
        { id: "takeoff", title: "Element from front or back", matches: (code: string) => /^5/.test(code), hint: "Code starts with 5" },
        { id: "double", title: "Double somersault", matches: (code: string) => /^8/.test(code), hint: "Code starts with 8" },
        { id: "twist", title: "At least 540° twist, at most 450° somersault", matches: (code: string) => code === "43" || code === "44", hint: "Code is 43 or 44" },
    ];
    // Assign distinct element positions to the four individual requirements.
    function canAssign(requirementIndex: number, used: Set<number>): boolean {
        if (requirementIndex === specialRequirements.length) return true;
        return codes.some((code, index) => {
            if (used.has(index) || !specialRequirements[requirementIndex].matches(code)) return false;
            return canAssign(requirementIndex + 1, new Set([...used, index]));
        });
    }
    return [
        { id: "count", title: "10 elements", passed: elements.length === 10, detail: `${elements.length}/10 elements` },
        { id: "unique", title: "All elements are different", passed: elements.length === 10 && seen.size === 10, detail: repeated.size ? `Repeated: ${[...repeated].join(", ")}` : `${seen.size} different elements` },
        { id: "somersaults", title: "At least 9 elements with 270° somersault", passed: somersaultCount >= 9, detail: `${somersaultCount} elements start with 3, 4, 5, 7, or 8` },
        ...specialRequirements.map((requirement) => {
            const matches = elements.filter((_, index) => requirement.matches(codes[index]));
            return { id: requirement.id, title: requirement.title, passed: matches.length > 0, detail: matches.length ? `Found: ${matches.join(", ")}` : requirement.hint };
        }),
        { id: "separate", title: "Requirements performed as separate elements", passed: canAssign(0, new Set()), detail: "The landing, takeoff, double, and twist requirements must use four separate elements." },
    ];
}
