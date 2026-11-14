"use client";

import { useState } from "react";
import AthleteEventsFields, { type ExternalPartnerOption, type PartnerOption } from "@/components/AthleteEventsFields";
import { prepareEventPayload, eventValidation, type AthleteEvents } from "@/lib/athlete-events";
import AthleteLevelField from "@/components/AthleteLevelField";
import AthleteDetailsFields from "@/components/AthleteDetailsFields";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Athlete = {
    id: number;
    name: string;
    level: string | null;
    coach_id: number | null;
    date_of_birth: string | null;
    gender: string | null;
    dmt_level: string | null;
    syn_level: string | null;
    synchro_partner_id: number | null;
    external_synchro_partner_id: number | null;
};

type Coach = {
    id: number;
    name: string;
};

export default function EditAthleteForm({
    athlete,
    coaches,
    triLevels,
    triLevelsError,
    partnerAthletes,
    partnersError,
    externalPartnerAvailable,
    externalAthletes,
    externalPartnersError,
}: {
    athlete: Athlete;
    coaches: Coach[];
    triLevels: string[];
    triLevelsError?: string;
    partnerAthletes: PartnerOption[];
    partnersError?: string;
    externalPartnerAvailable: boolean;
    externalAthletes: ExternalPartnerOption[];
    externalPartnersError?: string;
}) {
    const [name, setName] = useState(athlete.name);
    const [level, setLevel] = useState(athlete.level ?? "");
    const [dateOfBirth, setDateOfBirth] = useState(athlete.date_of_birth ?? "");
    const [gender, setGender] = useState(athlete.gender ?? "");
    const [coachId, setCoachId] = useState(athlete.coach_id ?? "");

    const [events, setEvents] = useState<AthleteEvents>({
        dmtLevel: athlete.dmt_level ?? "",
        synLevel: athlete.syn_level ?? "",
        partnerType: athlete.synchro_partner_id ? "club" : athlete.external_synchro_partner_id ? "external" : "none",
        partnerId: athlete.synchro_partner_id?.toString() ?? "",
        externalPartnerId: athlete.external_synchro_partner_id?.toString() ?? "",
        externalName: "",
        externalClub: "",
    });
    const router = useRouter();

    async function handleDelete(athleteId: number) {
        const confirmed = confirm(
            "Delete this athlete and all associated data?"
        );

        if (!confirmed) return;

        const supabase = createClient();

        const { error } = await supabase
            .from("athletes")
            .delete()
            .eq("id", athleteId);

        if (error) {
            alert(`Error deleting athlete: ${error.message}`);
            return;
        }

        alert("Athlete deleted!");

        router.push(`/coach/${coachId}/athletes`);
        router.refresh();
    }

    async function handleSave() {
        const eventError = eventValidation(events, athlete.id);
        if (eventError) { alert(eventError); return; }
        const supabase = createClient();
        let eventData;
        try {
            eventData = await prepareEventPayload(events, supabase, externalPartnerAvailable);
            setEvents(eventData.events);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Unable to save external partner.");
            return;
        }

        const { error } = await supabase
            .from("athletes")
            .update({
                name,
                level,
                coach_id: Number(coachId),
                date_of_birth: dateOfBirth || null,
                gender: gender.trim() || null,
                ...eventData.payload,
            })
            .eq("id", athlete.id);

        if (error) {
            alert(`Error saving athlete: ${error.message}`);
            return;
        }

        alert("Athlete saved!");
        router.push(`/coach/${coachId}/athletes`);
    }

    return (
        <div className="mt-6 space-y-5">
            <section aria-labelledby="athlete-details-heading" className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                <h2 id="athlete-details-heading" className="border-b border-red-200 bg-red-50 px-5 py-3 text-lg font-bold text-black">Athlete details</h2>
                <div className="space-y-5 p-5">
                    <div>
                        <label htmlFor="athlete-name" className="mb-1 block text-sm font-semibold text-black">Name</label>
                        <input
                            id="athlete-name"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-base text-black outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700"
                        />
                    </div>
                    <AthleteDetailsFields
                        dateOfBirth={dateOfBirth}
                        onDateOfBirthChange={setDateOfBirth}
                        gender={gender}
                        onGenderChange={setGender}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <AthleteLevelField value={level} onChange={setLevel} levels={triLevels} error={triLevelsError} />
                        <div>
                            <label htmlFor="athlete-coach" className="mb-1 block text-sm font-semibold text-black">Coach</label>
                            <select
                                id="athlete-coach"
                                value={coachId}
                                onChange={(e) => setCoachId(e.target.value)}
                                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-base text-black outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700"
                            >
                                <option value="">Select coach</option>
                                {coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="athlete-events-heading" className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                <h2 id="athlete-events-heading" className="border-b border-red-200 bg-red-50 px-5 py-3 text-lg font-bold text-black">DMT & Synchro</h2>
                <div className="p-5">
                    <AthleteEventsFields value={events} onChange={setEvents} athletes={partnerAthletes} athleteId={athlete.id} partnersError={partnersError} externalPartnerAvailable={externalPartnerAvailable} externalAthletes={externalAthletes} externalPartnersError={externalPartnersError} />
                </div>
            </section>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    className="min-h-11 w-full rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 sm:w-auto"
                >
                    Save Athlete
                </button>
            </div>
            <div className="flex justify-end border-t border-red-200 pt-5">
                <button
                    type="button"
                    onClick={() => handleDelete(athlete.id)}
                    className="min-h-11 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                >
                    Delete Athlete
                </button>
            </div>
        </div>
    );
}
