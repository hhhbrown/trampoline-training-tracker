"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EditRoutinesForm({ routines, athleteId }) {
    const [compulsory, setCompulsory] = useState(routines?.compulsory ?? "");
    const [optionalA, setOptionalA] = useState(routines?.optional_a ?? "");
    const [optionalB, setOptionalB] = useState(routines?.optional_b ?? "");
    const [notes, setNotes] = useState(routines?.notes ?? "");

    async function handleSave() {
        const supabase = createClient();

        const { error } = await supabase
            .from("routines")
            .upsert({
                athlete_id: athleteId,
                compulsory,
                optional_a: optionalA,
                optional_b: optionalB,
                notes,
            });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Routines saved!");
    }

    return (
        <section className="mt-10">
            <h2 className="text-xl font-semibold text-black">Routines</h2>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Compulsory
                    </label>
                    <input
                        value={compulsory}
                        onChange={(e) => setCompulsory(e.target.value)}
                        placeholder="Compulsory"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Optional A
                    </label>
                    <input
                        value={optionalA}
                        onChange={(e) => setOptionalA(e.target.value)}
                        placeholder="Optional A"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Optional B
                    </label>
                    <input
                        value={optionalB}
                        onChange={(e) => setOptionalB(e.target.value)}
                        placeholder="Optional B"
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