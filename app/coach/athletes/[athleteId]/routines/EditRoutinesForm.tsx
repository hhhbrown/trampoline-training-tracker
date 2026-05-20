"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EditRoutinesFormProps = {
    coachId: string;
    athleteId: string;
    athleteName: string;
    routines: {
        id: number;
        athlete_id: number;
        compulsory: string | null;
        optional_a: string | null;
        optional_b: string | null;
        notes: string | null;
    } | null;
};

export default function EditRoutinesForm({
    coachId,
    athleteId,
    athleteName,
    routines,
}: EditRoutinesFormProps) {
    const router = useRouter();
    const compulsoryOptions = [
        "Level 1 Compulsory",
        "Level 2 Compulsory",
        "Level 3 Compulsory",
        "Level 4 Compulsory",
        "Level 5+"
    ];
    const [compulsory, setCompulsory] = useState(routines?.compulsory ?? "");
    const [optionalA, setOptionalA] = useState(routines?.optional_a ?? "");
    const [optionalB, setOptionalB] = useState(routines?.optional_b ?? "");
    const [notes, setNotes] = useState(routines?.notes ?? "");

    async function handleSave() {
        const supabase = createClient();

        const payload = {
            athlete_id: Number(athleteId),
            compulsory,
            optional_a: optionalA,
            optional_b: optionalB,
            notes,
        };

        const { data, error } = await supabase
            .from("routines")
            .upsert(payload, { onConflict: "athlete_id" })
            .select()
            .single();

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        console.log("Saved routine:", data);
        alert("Routines saved!");
        router.refresh();
    }

    return (
        <section className="mt-10">
            <Link
                href={`/coach/${coachId}/athletes`}
                className="inline-flex items-center text-red-500 text-red-600 hover:text-black"
            >
                ← Back
            </Link>
            <h2 className="text-2xl font-semibold text-black">{athleteName}</h2>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Compulsory
                    </label>
                    <select
                        value={compulsory}
                        onChange={(e) => setCompulsory(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Select Level</option>

                        {compulsoryOptions.map((routine) => (
                            <option key={routine} value={routine}>
                                {routine}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Optional A
                    </label>
                    <textarea
                        value={optionalA}
                        onChange={(e) => setOptionalA(e.target.value)}
                        placeholder="One skill per line"
                        rows={6}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Optional B
                    </label>
                    <textarea
                        value={optionalB}
                        onChange={(e) => setOptionalB(e.target.value)}
                        placeholder="One skill per line"
                        rows={6}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Coaching notes"
                        rows={4}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            <button
                onClick={handleSave}
                className="mt-6 w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
                Save Routines
            </button>
        </section>
    );
}