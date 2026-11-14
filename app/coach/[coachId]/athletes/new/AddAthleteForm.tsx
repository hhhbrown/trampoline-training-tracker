"use client";

import { useState } from "react";
import AthleteEventsFields, { type ExternalPartnerOption, type PartnerOption } from "@/components/AthleteEventsFields";
import { prepareEventPayload, eventValidation, type AthleteEvents } from "@/lib/athlete-events";
import AthleteLevelField from "@/components/AthleteLevelField";
import AthleteDetailsFields from "@/components/AthleteDetailsFields";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type AddAthleteFormProps = {
    coachId: string;
    triLevels: string[];
    triLevelsError?: string;
    partnerAthletes: PartnerOption[];
    partnersError?: string;
    externalPartnerAvailable: boolean;
    externalAthletes: ExternalPartnerOption[];
    externalPartnersError?: string;
};

export default function AddAthleteForm({
    coachId,
    triLevels,
    triLevelsError,
    partnerAthletes,
    partnersError,
    externalPartnerAvailable,
    externalAthletes,
    externalPartnersError,
}: AddAthleteFormProps) {
    const [name, setName] = useState("");
    const [level, setLevel] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");

    const [events, setEvents] = useState<AthleteEvents>({ dmtLevel: "", synLevel: "", partnerType: "none", partnerId: "", externalPartnerId: "", externalName: "", externalClub: "" });
    const router = useRouter();

    async function handleSave() {
        const eventError = eventValidation(events);
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

        const { data: newAthlete, error: athleteError } = await supabase
            .from("athletes")
            .insert({
                name,
                level,
                coach_id: Number(coachId),
                date_of_birth: dateOfBirth || null,
                gender: gender.trim() || null,
                ...eventData.payload,
            })
            .select("id")
            .single();

        if (athleteError) {
            alert(`Error adding athlete: ${athleteError.message}`);
            return;
        }

        const { data: newPlan, error: planError } = await supabase
            .from("plans")
            .insert({
                athlete_id: newAthlete.id,
                week: "Week 1",
            })
            .select("id")
            .single();

        if (planError) {
            alert(
                `Athlete added, but plan was not created: ${planError.message}`
            );
            return;
        }

        await supabase.from("plan_items").insert([
            {
                plan_id: newPlan.id,
                name: "Daily Drills",
                target: null,
            },
            {
                plan_id: newPlan.id,
                name: "Compulsory",
                target: null,
            },
            {
                plan_id: newPlan.id,
                name: "Optional",
                target: null,
            },
        ]);

        alert("Athlete added!");

        router.push(`/coach/${coachId}/athletes`);
        router.refresh();
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

                <AthleteEventsFields value={events} onChange={setEvents} athletes={partnerAthletes} partnersError={partnersError} externalPartnerAvailable={externalPartnerAvailable} externalAthletes={externalAthletes} externalPartnersError={externalPartnersError} />

                <AthleteDetailsFields
                    dateOfBirth={dateOfBirth}
                    onDateOfBirthChange={setDateOfBirth}
                    gender={gender}
                    onGenderChange={setGender}
                />

                <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-black px-4 py-2 text-black font-medium text-white hover:bg-zinc-800"
                >
                    Add Athlete
                </button>

            </div>
        </section>
    );
}