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
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
                <div>
                    <label className="mb-1 block text-black font-medium text-zinc-700">
                        Name
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <AthleteLevelField value={level} onChange={setLevel} levels={triLevels} error={triLevelsError} />

                <div>
                    <label className="mb-1 block text-black font-medium text-zinc-700">
                        Coach
                    </label>
                    <select
                        value={coachId}
                        onChange={(e) => setCoachId(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Select coach</option>
                        {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                                {coach.name}
                            </option>
                        ))}
                    </select>
                </div>

                <AthleteEventsFields value={events} onChange={setEvents} athletes={partnerAthletes} athleteId={athlete.id} partnersError={partnersError} externalPartnerAvailable={externalPartnerAvailable} externalAthletes={externalAthletes} externalPartnersError={externalPartnersError} />

                <AthleteDetailsFields
                    dateOfBirth={dateOfBirth}
                    onDateOfBirthChange={setDateOfBirth}
                    gender={gender}
                    onGenderChange={setGender}
                />

                <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                    Save Athlete
                </button>
                <button
                    type="button"
                    onClick={() => handleDelete(athlete.id)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    Delete Athlete
                </button>
            </div>
        </section>
    );
}