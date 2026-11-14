import { dmtNationalsRounds, dmtWagcRounds } from "./dmt-nationals";
import { mobilityRoutineChecks, type QualificationRequirement, type MobilityCheck } from "./mobility";
import type { DDLookupEntry } from "./dd";
import type { DmtSetDraft } from "./dmt-sets";

export function dmtMobilityResults(rule: QualificationRequirement, sets: DmtSetDraft[], lookup: DDLookupEntry[]) {
    const supported = ["preliminary", "preliminary_or_final"].includes(rule.score_basis);
    if (!supported) return [{ routine: { name: "Round requirements", value: null, difficulty: null }, checks: [{ title: "Score basis", status: "unknown", detail: `Coach verification required for score basis: ${rule.score_basis}` }] as MobilityCheck[] }];
    const rounds = rule.score_basis === "preliminary" ? dmtWagcRounds(sets, lookup) : dmtNationalsRounds(sets, lookup);
    return rounds.map((routine) => {
        const complete = routine.difficulty != null;
        const checks: MobilityCheck[] = [
            { title: "Two complete passes", status: complete ? "met" : "unknown", detail: complete ? "Both passes have two matched skills" : "Complete both passes and resolve unmatched FIG codes" },
            ...mobilityRoutineChecks(rule, routine).map((check): MobilityCheck => !complete && check.status === "met" ? { ...check, status: "unknown", detail: "Complete this round before confirming the requirement" } : check),
        ];
        return { routine, checks };
    });
}
