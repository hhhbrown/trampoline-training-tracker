import { competesInEvent } from "@/lib/athlete-events";
import { resolveSynchroPartner } from "@/lib/synchro-partner";

export default async function AthleteEventSummary({ athlete }: {
    athlete: {
        id: number;
        dmt_level: string | null;
        syn_level: string | null;
        synchro_partner_id: number | null;
        external_synchro_partner_id?: number | null;
    };
}) {
    const dmt = competesInEvent(athlete.dmt_level);
    const pairing = await resolveSynchroPartner(athlete);
    const synLevel = athlete.syn_level || (pairing.inferred ? pairing.partner?.syn_level : null);
    const syn = competesInEvent(synLevel);
    if (!dmt && !syn && !pairing.conflict) return null;
    const partner = pairing.partner?.name || (pairing.externalPartner ? `${pairing.externalPartner.name}${pairing.externalPartner.club ? ` (${pairing.externalPartner.club})` : ""}` : athlete.external_synchro_partner_id ? "External partner" : null) || "Partner not assigned";
    return (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {dmt && <span className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-900">DMT · {athlete.dmt_level}</span>}
            {pairing.conflict && <span className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">Multiple synchro partner links — review in Edit Athlete</span>}
            {syn && <span className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-900">SYN · {synLevel}<span className="ml-2 font-normal">· {partner}</span></span>}
        </div>
    );
}
