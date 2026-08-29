"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";

type EditRoutinesFormProps = {
    coachId: string;
    athleteId: string;
    athleteName: string;
    routines: {
        id: number;
        athlete_id: number;
        compulsory: string | null;
        custom_compulsory: string | null;
        optional_a: string | null;
        optional_a_difficulty: number | null;
        optional_b: string | null;
        optional_b_difficulty: number | null;
        double_mini_set_a: string | null;
        double_mini_set_a_difficulty: number | null;
        double_mini_set_b: string | null;
        double_mini_set_b_difficulty: number | null;
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
    const [customCompulsory, setCustomCompulsory] = useState(
        routines?.custom_compulsory ?? ""
    );
    const [optionalA, setOptionalA] = useState(routines?.optional_a ?? "");
    const [optionalADifficulty, setOptionalADifficulty] = useState(
        routines?.optional_a_difficulty?.toString() ?? ""
    );
    const [optionalB, setOptionalB] = useState(routines?.optional_b ?? "");
    const [optionalBDifficulty, setOptionalBDifficulty] = useState(
        routines?.optional_b_difficulty?.toString() ?? ""
    );
    const [doubleMiniSetA, setDoubleMiniSetA] = useState(
        routines?.double_mini_set_a ?? ""
    );
    const [doubleMiniSetADifficulty, setDoubleMiniSetADifficulty] = useState(
        routines?.double_mini_set_a_difficulty?.toString() ?? ""
    );
    const [doubleMiniSetB, setDoubleMiniSetB] = useState(
        routines?.double_mini_set_b ?? ""
    );
    const [doubleMiniSetBDifficulty, setDoubleMiniSetBDifficulty] = useState(
        routines?.double_mini_set_b_difficulty?.toString() ?? ""
    );
    const [notes, setNotes] = useState(routines?.notes ?? "");

    async function handleSave() {
        const supabase = createClient();

        const payload = {
            athlete_id: Number(athleteId),
            compulsory,
            custom_compulsory:
                compulsory === "Level 5+" ? customCompulsory.trim() || null : null,
            optional_a: optionalA,
            optional_a_difficulty:
                optionalADifficulty === "" ? null : Number(optionalADifficulty),
            optional_b: optionalB,
            optional_b_difficulty:
                optionalBDifficulty === "" ? null : Number(optionalBDifficulty),
            double_mini_set_a: doubleMiniSetA,
            double_mini_set_a_difficulty:
                doubleMiniSetADifficulty === ""
                    ? null
                    : Number(doubleMiniSetADifficulty),
            double_mini_set_b: doubleMiniSetB,
            double_mini_set_b_difficulty:
                doubleMiniSetBDifficulty === ""
                    ? null
                    : Number(doubleMiniSetBDifficulty),
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
        router.push(`/coach/${coachId}/athletes`);
    }

    return (
        <section className="mt-10">
            <BackLink
                href={`/coach/${coachId}/athletes`}
            >
                Back
            </BackLink>
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

                {compulsory === "Level 5+" && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">
                            Custom Compulsory
                        </label>
                        <textarea
                            value={customCompulsory}
                            onChange={(e) => setCustomCompulsory(e.target.value)}
                            placeholder="One skill per line"
                            rows={10}
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                )}

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
                    <label className="mt-3 mb-1 block text-sm font-medium text-zinc-700">
                        Degree of Difficulty
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={optionalADifficulty}
                        onChange={(e) => setOptionalADifficulty(e.target.value)}
                        placeholder="e.g. 8.4"
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
                    <label className="mt-3 mb-1 block text-sm font-medium text-zinc-700">
                        Degree of Difficulty
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={optionalBDifficulty}
                        onChange={(e) => setOptionalBDifficulty(e.target.value)}
                        placeholder="e.g. 8.4"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="border-t border-zinc-200 pt-4">
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Double Mini Set A
                    </label>
                    <textarea
                        value={doubleMiniSetA}
                        onChange={(e) => setDoubleMiniSetA(e.target.value)}
                        placeholder="One skill per line"
                        rows={4}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <label className="mt-3 mb-1 block text-sm font-medium text-zinc-700">
                        Degree of Difficulty
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={doubleMiniSetADifficulty}
                        onChange={(e) => setDoubleMiniSetADifficulty(e.target.value)}
                        placeholder="e.g. 4.8"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">
                        Double Mini Set B
                    </label>
                    <textarea
                        value={doubleMiniSetB}
                        onChange={(e) => setDoubleMiniSetB(e.target.value)}
                        placeholder="One skill per line"
                        rows={4}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <label className="mt-3 mb-1 block text-sm font-medium text-zinc-700">
                        Degree of Difficulty
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={doubleMiniSetBDifficulty}
                        onChange={(e) => setDoubleMiniSetBDifficulty(e.target.value)}
                        placeholder="e.g. 4.8"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="border-t border-zinc-200 pt-4">
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
