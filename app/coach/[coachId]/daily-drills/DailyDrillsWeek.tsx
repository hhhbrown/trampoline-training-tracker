"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { DAYS, saveDailyDrills, validateDailyDrills, type DailyDrillEntry, type EditableDrill as EditableEntry } from "@/lib/daily-drills";

export default function DailyDrillsWeek({
    coachId,
    initialEntries,
}: {
    coachId: number;
    initialEntries: DailyDrillEntry[];
}) {
    const [entries, setEntries] = useState<EditableEntry[]>(initialEntries);
    const [deletedIds, setDeletedIds] = useState<number[]>([]);
    const [saving, setSaving] = useState(false);
    const nextTemporaryId = useRef(-1);

    function addDrill(dayOfWeek: number) {
        setEntries((current) => [
            ...current,
            {
                id: nextTemporaryId.current--,
                coach_id: coachId,
                day_of_week: dayOfWeek,
                exercise: "",
                isNew: true,
            },
        ]);
    }

    function updateEntry(
        id: number,
        value: string
    ) {
        setEntries((current) =>
            current.map((entry) =>
                entry.id === id ? { ...entry, exercise: value } : entry
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
        if (saving) return;
        const validation = validateDailyDrills(entries);
        if (validation) { alert(validation); return; }
        setSaving(true);
        try {
            await saveDailyDrills(createClient(), coachId, entries, deletedIds,
                (temporaryId, saved) => setEntries((current) => current.map((entry) => entry.id === temporaryId ? saved : entry)),
                (id) => setDeletedIds((current) => current.filter((deletedId) => deletedId !== id)));
            alert("Daily drills saved!");
        } catch (error) {
            alert(`Daily drills save incomplete: ${error instanceof Error ? error.message : "Please try again."}`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="mt-8">
            <fieldset disabled={saving} className="min-w-0 space-y-4 disabled:opacity-70">
                {DAYS.map((day, index) => {
                    const dayOfWeek = index + 1;
                    const dayEntries = entries
                        .filter((entry) => entry.day_of_week === dayOfWeek)
;

                    return (
                        <section
                            key={day}
                            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-lg font-semibold text-black">{day}</h2>
                                <button
                                    type="button"
                                    onClick={() => addDrill(dayOfWeek)}
                                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-zinc-100"
                                >
                                    + Add Drill
                                </button>
                            </div>

                            {dayEntries.length > 0 ? (
                                <div className="mt-4 space-y-3">
                                    {dayEntries.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="grid gap-3 border-t border-zinc-100 pt-3 sm:grid-cols-[minmax(0,1fr)_76px] sm:items-end"
                                        >
                                            <label className="text-xs font-medium text-zinc-500">
                                                Drill
                                                <input
                                                    value={entry.exercise}
                                                    placeholder="Drill"
                                                    onChange={(event) =>
                                                        updateEntry(entry.id, event.target.value)
                                                    }
                                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-red-500 sm:mt-0"
                                                />
                                            </label>

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
                                    No drills added.
                                </p>
                            )}
                        </section>
                    );
                })}
            </fieldset>

            <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Daily Drills"}
            </button>
        </section>
    );
}

