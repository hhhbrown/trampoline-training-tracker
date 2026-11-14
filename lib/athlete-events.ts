import type { SupabaseClient } from "@supabase/supabase-js";

export const DMT_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Novice", "Level 5", "Level 6", "Junior", "Senior"];
export const SYN_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Senior"];

export function competesInEvent(level: string | null | undefined) {
    return Boolean(level?.trim()) && !["doesn't compete", "doesn’t compete", "doesn't compete in this event", "doesn’t compete in this event"].includes(level!.trim().toLowerCase());
}

export type AthleteEvents = {
    dmtLevel: string;
    synLevel: string;
    partnerType: "none" | "club" | "external";
    partnerId: string;
    externalPartnerId: string;
    externalName: string;
    externalClub: string;
};

export function eventPayload(events: AthleteEvents, externalPartnerAvailable = true) {
    const syn = competesInEvent(events.synLevel);
    return {
        dmt_level: competesInEvent(events.dmtLevel) ? events.dmtLevel : null,
        syn_level: syn ? events.synLevel : null,
        synchro_partner_id: syn && events.partnerType === "club" && events.partnerId ? Number(events.partnerId) : null,
        ...(externalPartnerAvailable ? { external_synchro_partner_id: syn && events.partnerType === "external" && events.externalPartnerId !== "new" && events.externalPartnerId ? Number(events.externalPartnerId) : null } : {}),
    };
}

export function eventValidation(events: AthleteEvents, athleteId?: number) {
    if (!competesInEvent(events.synLevel)) return null;
    if (events.partnerType === "club" && (!/^\d+$/.test(events.partnerId) || Number(events.partnerId) === athleteId)) return "Select another club athlete as the synchro partner.";
    if (events.partnerType === "external" && events.externalPartnerId !== "new" && !/^\d+$/.test(events.externalPartnerId)) return "Select an external synchro partner.";
    if (events.partnerType === "external" && events.externalPartnerId === "new" && !events.externalName.trim()) return "Enter the external synchro partner’s name.";
    return null;
}

export async function prepareEventPayload(events: AthleteEvents, client: SupabaseClient, externalPartnerAvailable: boolean) {
    let resolved = events;
    if (competesInEvent(events.synLevel) && events.partnerType === "external") {
        if (!externalPartnerAvailable) throw new Error("External partner access is unavailable. Reload and check database permissions.");
        if (events.externalPartnerId === "new") {
            const { data, error } = await client.from("external_athletes")
                .insert({ name: events.externalName.trim(), club: events.externalClub.trim() || null })
                .select("id").single();
            if (error) throw new Error(error.message);
            resolved = { ...events, externalPartnerId: String(data.id) };
        }
    }
    return { events: resolved, payload: eventPayload(resolved, externalPartnerAvailable) };
}
