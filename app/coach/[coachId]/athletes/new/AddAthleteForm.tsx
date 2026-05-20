"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type AddAthleteFormProps = {
    coachId: string;
};

export default function AddAthleteForm({
    coachId,
}: AddAthleteFormProps) {
    const [name, setName] = useState("");
    const [level, setLevel] = useState("");

    const router = useRouter();

    async function handleSave() {
        const supabase = createClient();

        const { data: newAthlete, error: athleteError } = await supabase
            .from("athletes")
            .insert({
                name,
                level,
                coach_id: Number(coachId),
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

                <div>
                    <label className="mb-1 block text-black font-medium text-zinc-700">
                        Level
                    </label>

                    <input
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

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