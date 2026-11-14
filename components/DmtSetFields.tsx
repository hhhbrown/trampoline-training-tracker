"use client";

import DmtRepetitions from "./DmtRepetitions";
import DmtPassDifficulty from "./DmtPassDifficulty";
import type { DDLookupEntry } from "@/lib/dd";
import type { DmtSetDraft } from "@/lib/dmt-sets";

export default function DmtSetFields({ value, onChange, error, ddLookup, ddLookupError, level, idPrefix = "dmt-set" }: { value: DmtSetDraft; onChange: (value: DmtSetDraft) => void; error?: string | null; ddLookup: DDLookupEntry[]; ddLookupError?: string | null; level: string | null; idPrefix?: string }) {
    const style = "w-full min-w-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-base text-black focus:outline-none focus:ring-2 focus:ring-red-700";
    return (
        <section aria-labelledby={`${idPrefix}-heading`}>
            <h2 id={`${idPrefix}-heading`} className="mb-3 text-xl font-bold text-black">DMT · {value.name || "Set 1"}</h2>
            {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</p> : (
                <>
                <div className="grid gap-4 sm:grid-cols-2">
                    {value.passes.map((pass, index) => {
                        const update = (changes: Partial<typeof pass>) => onChange({ ...value, passes: value.passes.map((row, i) => i === index ? { ...row, ...changes } : row) });
                        return (
                            <fieldset key={pass.passNumber} className="min-w-0 overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
                                <legend className="ml-3 rounded-md bg-black px-3 py-1 text-sm font-semibold text-white">Pass {pass.passNumber}</legend>
                                <div className="space-y-3 p-4">
                                    <DmtPassDifficulty pass={pass} lookup={ddLookup} error={ddLookupError} />
                                    <div><label htmlFor={`${idPrefix}-placement-${pass.passNumber}`} className="mb-1 block text-sm font-semibold text-black">First skill placement</label>
                                        <select id={`${idPrefix}-placement-${pass.passNumber}`} value={pass.firstPlacement} onChange={(event) => update({ firstPlacement: event.target.value as "mount" | "spotter" })} className={style}><option value="mount">Mount</option><option value="spotter">Spotter</option></select>
                                    </div>
                                    <div><label htmlFor={`${idPrefix}-first-${pass.passNumber}`} className="mb-1 block text-sm font-semibold capitalize text-black">{pass.firstPlacement}</label><input id={`${idPrefix}-first-${pass.passNumber}`} value={pass.firstCode} onChange={(event) => update({ firstCode: event.target.value })} placeholder="FIG code" className={style} /></div>
                                    <div><label htmlFor={`${idPrefix}-dismount-${pass.passNumber}`} className="mb-1 block text-sm font-semibold text-black">Dismount</label><input id={`${idPrefix}-dismount-${pass.passNumber}`} value={pass.dismountCode} onChange={(event) => update({ dismountCode: event.target.value })} placeholder="FIG code" className={style} /></div>
                                </div>
                            </fieldset>
                        );
                    })}
                </div>
                <DmtRepetitions set={value} level={level} />
                </>
            )}
        </section>
    );
}
