import { createClient } from "@/lib/supabase/server";
import { competesInEvent } from "./athlete-events";

export type SynchroProfile = {
    id: number;
    syn_level: string | null;
    synchro_partner_id: number | null;
    external_synchro_partner_id?: number | null;
};

// A single saved club link describes a pair; either athlete can display it.
export async function resolveSynchroPartner(athlete: SynchroProfile): Promise<{
    partner: { id: number; name: string; syn_level: string | null } | null;
    externalPartner?: { id: number; name: string; club: string | null } | null;
    inferred: boolean;
    conflict: boolean;
}> {
    const supabase = await createClient();
    if (athlete.external_synchro_partner_id) {
        const { data } = await supabase.from("external_athletes").select("id, name, club").eq("id", athlete.external_synchro_partner_id).maybeSingle();
        return { partner: null, externalPartner: data, inferred: false, conflict: false };
    }
    if (athlete.synchro_partner_id && athlete.synchro_partner_id !== athlete.id) {
        const { data } = await supabase.from("athletes").select("id, name, syn_level, synchro_partner_id, external_synchro_partner_id").eq("id", athlete.synchro_partner_id).maybeSingle();
        if (data && (data.external_synchro_partner_id || (data.synchro_partner_id && data.synchro_partner_id !== athlete.id))) {
            return { partner: null, inferred: false, conflict: true };
        }
        return { partner: data as { id: number; name: string; syn_level: string | null } | null, inferred: false, conflict: false };
    }
    const { data, error } = await supabase.from("athletes").select("id, name, syn_level")
        .eq("synchro_partner_id", athlete.id).neq("id", athlete.id);
    const partners = (data ?? []).filter((partner) => competesInEvent(partner.syn_level));
    return { partner: !error && partners.length === 1 ? partners[0] as { id: number; name: string; syn_level: string | null } : null, inferred: partners.length === 1, conflict: partners.length > 1 };
}
