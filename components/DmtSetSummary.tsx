import type { DmtSetDraft } from "@/lib/dmt-sets";

export default function DmtSetSummary({ set, error }: { set: DmtSetDraft; error?: string | null }) {
    return (
        <section aria-labelledby="double-mini-heading">
            <h2 id="double-mini-heading" className="mb-4 text-xl font-bold text-red-900">DMT · Set 1</h2>
            {error ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : (
                <div className="grid gap-5 md:grid-cols-2">
                    {set.passes.map((pass) => (
                        <section key={pass.passNumber} className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                            <h3 className="border-b border-red-100 bg-red-50 px-5 py-4 text-lg font-bold text-red-900">Pass {pass.passNumber}</h3>
                            <dl className="divide-y divide-zinc-100">
                                <div className="flex items-baseline gap-4 px-5 py-4"><dt className="w-20 shrink-0 text-sm font-semibold capitalize text-red-800">{pass.firstPlacement}</dt><dd className="min-w-0 break-words text-base font-medium text-zinc-950">{pass.firstCode || "Not added yet"}</dd></div>
                                <div className="flex items-baseline gap-4 px-5 py-4"><dt className="w-20 shrink-0 text-sm font-semibold text-red-800">Dismount</dt><dd className="min-w-0 break-words text-base font-medium text-zinc-950">{pass.dismountCode || "Not added yet"}</dd></div>
                            </dl>
                        </section>
                    ))}
                </div>
            )}
        </section>
    );
}
