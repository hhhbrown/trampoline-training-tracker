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

    async function handleDelete() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this athlete? This cannot be undone."
        );

        if (!confirmed) return;

        const supabase = createClient();

        const { error } = await supabase
            .from("athletes")
            .delete()
            .eq("id", athlete.id);

        if (error) {
            alert(`Error deleting athlete: ${error.message}`);
            return;
        }

        alert("Athlete deleted.");
        router.push("/coach");
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
                    Save Athlete
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    Delete Athlete
                </button>
            </div>
        </section>
    );
}