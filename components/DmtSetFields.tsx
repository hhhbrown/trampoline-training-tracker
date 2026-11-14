"use client";

import type { DmtSetDraft } from "@/lib/dmt-sets";

export default function DmtSetFields({ value, onChange, error }: { value: DmtSetDraft; onChange: (value: DmtSetDraft) => void; error?: string | null }) {
    const style = "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-700";
    return (
        <section aria-labelledby="dmt-set-heading">
            <h3 id="dmt-set-heading" className="mb-3 text-xl font-bold text-red-900">DMT · Set 1</h3>
            {error ? <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {value.passes.map((pass, index) => {
                        const update = (changes: Partial<typeof pass>) => onChange({ ...value, passes: value.passes.map((row, i) => i === index ? { ...row, ...changes } : row) });
                        return (
                            <fieldset key={pass.passNumber} className="min-w-0 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
                                <legend className="ml-3 px-2 text-base font-bold text-red-900">Pass {pass.passNumber}</legend>
                                <div className="space-y-3 p-4">
                                    <div><label htmlFor={`dmt-placement-${pass.passNumber}`} className="mb-1 block text-sm font-semibold text-zinc-700">First skill placement</label>
                                        <select id={`dmt-placement-${pass.passNumber}`} value={pass.firstPlacement} onChange={(event) => update({ firstPlacement: event.target.value as "mount" | "spotter" })} className={style}><option value="mount">Mount</option><option value="spotter">Spotter</option></select>
                                    </div>
                                    <div><label htmlFor={`dmt-first-${pass.passNumber}`} className="mb-1 block text-sm font-semibold capitalize text-zinc-700">{pass.firstPlacement}</label><input id={`dmt-first-${pass.passNumber}`} value={pass.firstCode} onChange={(event) => update({ firstCode: event.target.value })} placeholder="FIG code" className={style} /></div>
                                    <div><label htmlFor={`dmt-dismount-${pass.passNumber}`} className="mb-1 block text-sm font-semibold text-zinc-700">Dismount</label><input id={`dmt-dismount-${pass.passNumber}`} value={pass.dismountCode} onChange={(event) => update({ dismountCode: event.target.value })} placeholder="FIG code" className={style} /></div>
                                </div>
                            </fieldset>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
