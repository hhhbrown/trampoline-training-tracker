import { dmtRepetitions, dmtRepetitionRule } from "@/lib/dmt-repetitions";
import type { DmtSetDraft } from "@/lib/dmt-sets";

export default function DmtRepetitions({ set, level }: { set: DmtSetDraft; level: string | null }) {
    const rule = dmtRepetitionRule(level);
    const repetitions = dmtRepetitions(set, level);
    const complete = set.passes.length > 1 && set.passes.every((pass) => pass.firstCode.trim() && pass.dismountCode.trim());
    return (
        <div aria-live="polite" className="mt-4 space-y-3">
            {rule !== "unknown" && <p className="text-xs leading-5 text-zinc-600">{rule === "zone" ? "Zone repetition: a skill may repeat in different zones, but not in the same zone. The rule applies across Preliminary and Finals combined." : "WGYM repetition: four different skills are required within a round. Skills can repeat in a different round."}</p>}
            {!repetitions.length && complete && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">✓ No repetitions in this set.</p>}
            {repetitions.map((repeat) => (
                <div key={repeat.code} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${repeat.violation === true ? "border-red-200 bg-red-50 text-red-900" : repeat.violation === false ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                    <p className="font-bold">{repeat.violation === true ? "✕ Repetition not allowed" : repeat.violation === false ? "✓ Repetition allowed" : "Repeated skill"}: {repeat.code}</p>
                    <p className="capitalize">{repeat.occurrences.map((entry) => `Pass ${entry.passNumber} · ${entry.placement}`).join("; ")}</p>
                    <p>{rule === "wgym" ? "The same skill cannot repeat within a round, regardless of zone." : rule === "zone" ? repeat.samePlacement ? "The same skill repeats in the same zone." : "The skill repeats in different zones, which is allowed at this level." : "Select a DMT level to check the repetition rule."} DD totals are unchanged.</p>
                </div>
            ))}
        </div>
    );
}
