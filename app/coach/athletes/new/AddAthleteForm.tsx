"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Coach = {
    id: number;
    name: string;
};

export default function AddAthleteForm({ coaches }: { coaches: Coach[] }) {
    const [name, setName] = useState("");
    const [level, setLevel] = useState("");
    const [coachId, setCoachId] = useState("");

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
            alert(`Athlete added, but plan was not created: ${planError.message}`);
            return;
        }

        await supabase.from("plan_items").insert([
            { plan_id: newPlan.id, name: "Daily Drills", target: null },
            { plan_id: newPlan.id, name: "Compulsory", target: null },
            { plan_id: newPlan.id, name: "Optional", target: null },
        ]);

        alert("Athlete added!");
        setName("");
        setLevel("");
        setCoachId("");
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
                        placeholder="Name"
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
                        placeholder="Level"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
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
                    Add Athlete
                </button>
            </div>
        </section>
    );
}