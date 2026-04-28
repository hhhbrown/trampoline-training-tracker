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

        const { error } = await supabase.from("athletes").insert({
            name,
            level,
            coach_id: Number(coachId),
        });

        if (error) {
            alert(`Error adding athlete: ${error.message}`);
            return;
        }

        alert("Athlete added!");
        setName("");
        setLevel("");
        setCoachId("");
    }

    return (
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Name
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Level
                    </label>
                    <input
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        placeholder="Level 2"
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Coach
                    </label>
                    <select
                        value={coachId}
                        onChange={(e) => setCoachId(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
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