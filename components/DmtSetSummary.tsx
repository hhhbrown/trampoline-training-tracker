import DmtRepetitions from "./DmtRepetitions";
import DmtPassDifficulty from "./DmtPassDifficulty";
import type { DDLookupEntry } from "@/lib/dd";
import type { DmtSetDraft } from "@/lib/dmt-sets";

export default function DmtSetSummary({ set, error, ddLookup, ddLookupError, level }: { set: DmtSetDraft; error?: string | null; ddLookup: DDLookupEntry[]; ddLookupError?: string | null; level: string | null }) {
    return (
        <section aria-labelledby={`dmt-summary-${set.id ?? set.name}-heading`}>
            <h2 id={`dmt-summary-${set.id ?? set.name}-heading`} className="mb-4 text-xl font-bold text-red-900">DMT · {set.name || "Set 1"}</h2>
            {error ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : (
                <>
                <div className="grid gap-5 md:grid-cols-2">
                    {set.passes.map((pass) => (
                        <section key={pass.passNumber} className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                            <h3 className="border-b border-red-100 bg-red-50 px-5 py-4 text-lg font-bold text-red-900">Pass {pass.passNumber}</h3>
                            <div className="px-5 pt-4"><DmtPassDifficulty pass={pass} lookup={ddLookup} error={ddLookupError} /></div>
                            <dl className="divide-y divide-zinc-100">
                                <div className="flex items-baseline gap-4 px-5 py-4"><dt className="w-20 shrink-0 text-sm font-semibold capitalize text-red-800">{pass.firstPlacement}</dt><dd className="min-w-0 break-words text-base font-medium text-zinc-950">{pass.firstCode || "Not added yet"}</dd></div>
                                <div className="flex items-baseline gap-4 px-5 py-4"><dt className="w-20 shrink-0 text-sm font-semibold text-red-800">Dismount</dt><dd className="min-w-0 break-words text-base font-medium text-zinc-950">{pass.dismountCode || "Not added yet"}</dd></div>
                            </dl>
                        </section>
                    ))}
                </div>
                <DmtRepetitions set={set} level={level} />
                </>
            )}
        </section>
    );
}
