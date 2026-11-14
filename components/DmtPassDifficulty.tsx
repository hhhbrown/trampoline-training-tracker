import { calculateDmtDD } from "@/lib/dmt-dd";
import type { DDLookupEntry } from "@/lib/dd";
import type { DmtPassDraft } from "@/lib/dmt-sets";

export default function DmtPassDifficulty({ pass, lookup, error }: { pass: DmtPassDraft; lookup: DDLookupEntry[]; error?: string | null }) {
    const calculation = calculateDmtDD(pass, lookup);
    const qualifier = calculation.unmatched.length ? " (matched skills only)" : !calculation.complete && calculation.total != null ? " (incomplete pass)" : "";
    return (
        <div aria-live="polite" className="space-y-2">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-base font-bold tabular-nums text-red-900">DD: {error ? "Unavailable" : calculation.total?.toFixed(2) ?? "—"}{!error && qualifier}</p>
            {error ? <p className="text-sm leading-6 text-amber-900">{error}</p> : calculation.unmatched.map((code) => (
                <p key={code} className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900">Calculation done, please note no match was found in our database for skill {code}.</p>
            ))}
        </div>
    );
}
