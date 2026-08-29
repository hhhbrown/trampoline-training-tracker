"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ConditioningEntry = {
    id: number;
    coach_id: number;
    day_of_week: number;
    exercise: string;
    sets: number;
    reps: number;
    sort_order: number;
};

type EditableEntry = Omit<ConditioningEntry, "sets" | "reps" | "sort_order"> & {
    sets: number | null;
    reps: number | null;
    sort_order: number | null;
    isNew?: boolean;
};

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function ConditioningWeek({
    coachId,
    initialEntries,
}: {
    coachId: number;
    initialEntries: ConditioningEntry[];
}) {
    const [entries, setEntries] = useState<EditableEntry[]>(initialEntries);
    const [deletedIds, setDeletedIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);

    function addExercise(dayOfWeek: number) {
        const dayEntries = entries.filter(
            (entry) => entry.day_of_week === dayOfWeek
        );
        const nextSortOrder =
            Math.max(0, ...dayEntries.map((entry) => entry.sort_order ?? 0)) + 1;

        setEntries((current) => [
            ...current,
            {
                id: -Date.now(),
                coach_id: coachId,
                day_of_week: dayOfWeek,
                exercise: "",
                sets: 1,
                reps: 1,
                sort_order: nextSortOrder,
                isNew: true,
            },
        ]);
    }

    function updateEntry(
        id: number,
        field: "exercise" | "sets" | "reps" | "sort_order",
        value: string | number | null
    ) {
        setEntries((current) =>
            current.map((entry) =>
                entry.id === id ? { ...entry, [field]: value } : entry
            )
        );
    }

    function deleteEntry(entry: EditableEntry) {
        setEntries((current) =>
            current.filter((currentEntry) => currentEntry.id !== entry.id)
        );

        if (!entry.isNew) {
            setDeletedIds((current) => [...current, entry.id]);
        }
    }

    async function handleSave() {
        const invalidEntry = entries.find(
            (entry) =>
                !entry.exercise.trim() ||
                entry.sets === null ||
                entry.sets < 1 ||
                entry.reps === null ||
                entry.reps < 1
        );

        if (invalidEntry) {
            alert("Every exercise needs a name, at least one set, and at least one rep.");
            return;
        }

        setSaving(true);
        const supabase = createClient();
        const savedEntries: EditableEntry[] = [];

        for (const id of deletedIds) {
            const { error } = await supabase
                .from("conditioning_entries")
                .delete()
                .eq("id", id)
                .eq("coach_id", coachId);

            if (error) {
                setSaving(false);
                alert(`Error deleting exercise: ${error.message}`);
                return;
            }
        }

        for (const entry of entries) {
            const values = {
                coach_id: coachId,
                day_of_week: entry.day_of_week,
                exercise: entry.exercise.trim(),
                sets: entry.sets,
                reps: entry.reps,
                sort_order: entry.sort_order ?? 0,
            };

            if (entry.isNew) {
                const { data, error } = await supabase
                    .from("conditioning_entries")
                    .insert(values)
                    .select("id, coach_id, day_of_week, exercise, sets, reps, sort_order")
                    .single();

                if (error) {
                    setSaving(false);
                    alert(`Error adding ${entry.exercise}: ${error.message}`);
                    return;
                }

                savedEntries.push(data);
            } else {
                const { error } = await supabase
                    .from("conditioning_entries")
                    .update(values)
                    .eq("id", entry.id)
                    .eq("coach_id", coachId);

                if (error) {
                    setSaving(false);
                    alert(`Error saving ${entry.exercise}: ${error.message}`);
                    return;
                }

                savedEntries.push(entry);
            }
        }

        setEntries(savedEntries);
        setDeletedIds([]);
        setSaving(false);
        alert("Conditioning saved!");
    }

    return (
        <section className="mt-8">
            <div className="space-y-4">
                {DAYS.map((day, index) => {
                    const dayOfWeek = index + 1;
                    const dayEntries = entries
                        .filter((entry) => entry.day_of_week === dayOfWeek)
                        .sort(
                            (a, b) =>
                                (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                                a.id - b.id
                        );

                    return (
                        <section
                            key={day}
                            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg font-semibold text-black">{day}</h2>
                                <button
                                    type="button"
                                    onClick={() => addExercise(dayOfWeek)}
                                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-zinc-100"
                                >
                                    + Add Exercise
                                </button>
                            </div>

                            {dayEntries.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                    <div className="hidden grid-cols-[minmax(0,1fr)_72px_72px_88px_76px] gap-3 px-1 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:grid">
                                        <span>Exercise</span>
                                        <span>Sets</span>
                                        <span>Reps</span>
                                        <span>Order</span>
                                        <span />
                                    </div>

                                    {dayEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-[minmax(0,1fr)_72px_72px_88px_76px] sm:items-end"
                                        >
                                            <label className="text-xs font-medium text-zinc-500 sm:text-transparent">
                                                Exercise
                                                <input
                                                    value={entry.exercise}
                                                    placeholder="Exercise"
                                                    onChange={(event) =>
                                                        updateEntry(entry.id, "exercise", event.target.value)
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500 sm:mt-0"
                                                />
                                            </label>

                                            <NumberField
                                                label="Sets"
                                                value={entry.sets}
                                                min={1}
                                                onChange={(value) => updateEntry(entry.id, "sets", value)}
                                            />
                                            <NumberField
                                                label="Reps"
                                                value={entry.reps}
                                                min={1}
                                                onChange={(value) => updateEntry(entry.id, "reps", value)}
                                            />
                                            <NumberField
                                                label="Order"
                                                value={entry.sort_order}
                                                min={0}
                                                onChange={(value) => updateEntry(entry.id, "sort_order", value)}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => deleteEntry(entry)}
                                                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-zinc-400">
                                    No conditioning exercises added.
                                </p>
                            )}
                        </section>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Conditioning"}
            </button>
        </section>
    );
}

function NumberField({
    label,
    value,
    min,
    onChange,
}: {
    label: string;
    value: number | null;
    min: number;
    onChange: (value: number | null) => void;
}) {
    return (
        <label className="text-xs font-medium text-zinc-500 sm:text-transparent">
            {label}
            <input
                type="number"
                min={min}
                value={value ?? ""}
                onChange={(event) =>
                    onChange(event.target.value === "" ? null : Number(event.target.value))
                }
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500 sm:mt-0"
            />
        </label>
    );
}
