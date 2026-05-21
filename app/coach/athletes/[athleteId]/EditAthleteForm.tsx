"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Athlete = {
    id: number;
    name: string;
    level: string | null;
    coach_id: number | null;
};

type Coach = {
    id: number;
    name: string;
};

export default function EditAthleteForm({
    athlete,
    coaches,
}: {
    athlete: Athlete;
    coaches: Coach[];
}) {
    const [name, setName] = useState(athlete.name);
    const [level, setLevel] = useState(athlete.level ?? "");
    const [coachId, setCoachId] = useState(athlete.coach_id ?? "");

    const router = useRouter();

    async function handleDelete(athleteId: number) {
        const supabase = createClient();
        const id = Number(athleteId);

        const { data: plans, error: plansFetchError } = await supabase
            .from("plans")
            .select("id")
            .eq("athlete_id", id);

        if (plansFetchError) {
            alert(`Error finding plans: ${plansFetchError.message}`);
            return;
        }

        const planIds = plans?.map((plan) => plan.id) ?? [];

        if (planIds.length > 0) {
            const { error: planItemsError } = await supabase
                .from("plan_items")
                .delete()
                .in("plan_id", planIds);

            if (planItemsError) {
                alert(`Error deleting plan items: ${planItemsError.message}`);
                return;
            }
        }

        const { error: plansError } = await supabase
            .from("plans")
            .delete()
            .eq("athlete_id", id);

        if (plansError) {
            alert(`Error deleting plans: ${plansError.message}`);
            return;
        }

        const { error: routinesError } = await supabase
            .from("routines")
            .delete()
            .eq("athlete_id", id);

        if (routinesError) {
            alert(`Error deleting routines: ${routinesError.message}`);
            return;
        }

        const { error: athleteError } = await supabase
            .from("athletes")
            .delete()
            .eq("id", id);

        if (athleteError) {
            alert(`Error deleting athlete: ${athleteError.message}`);
            return;
        }

        alert("Athlete deleted!");

        router.push(`/coach/${athlete.coach_id}/athletes`);
        router.refresh();
    }

    async function handleSave() {
        const supabase = createClient();

        const { error } = await supabase
            .from("athletes")
            .update({
                name,
                level,
                coach_id: Number(coachId),
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

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Level
                    </label>
                    <input
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

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