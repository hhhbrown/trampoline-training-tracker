"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PlanItem = {
    id: number;
    name: string | null;
    target: number | null;
};

type OptionalRoutine = {
    planItemName: "optional a" | "optional b";
    difficulty: number | null;
};

export default function DailyPlanForm({
    athleteId,
    planItems,
    initialCheckedItems,
    initialComments,
    optionalRoutines,
}: {
    athleteId: string;
    planItems: PlanItem[];
    initialCheckedItems: number[];
    initialComments: string;
    optionalRoutines: OptionalRoutine[];
}) {
    const [checkedItems, setCheckedItems] = useState<number[]>(initialCheckedItems);
    const [comments, setComments] = useState(initialComments);

    async function toggleItem(id: number) {
        const supabase = createClient();

        const isCurrentlyChecked = checkedItems.includes(id);
        const newCompletedValue = !isCurrentlyChecked;

        setCheckedItems((current) =>
            isCurrentlyChecked
                ? current.filter((itemId) => itemId !== id)
                : [...current, id]
        );

        const { error } = await supabase
            .from("training_logs")
            .upsert(
                {
                    athlete_id: Number(athleteId),
                    plan_item_id: id,
                    completed: newCompletedValue,
                    comments,
                },
                {
                    onConflict: "athlete_id,plan_item_id",
                }
            );

        if (error) {
            alert(error.message);
        }
    }

    async function handleSubmit() {
        const supabase = createClient();

        const checkedPlanItems = planItems.filter((item) =>
            checkedItems.includes(item.id)
        );

        const completedCount = (planItemName: string) =>
            checkedPlanItems.filter(
                (item) => item.name?.trim().toLowerCase() === planItemName
            ).length;

        const recordedAt = new Date().toISOString();
        const progressRows = [
            {
                athlete_id: Number(athleteId),
                recorded_at: recordedAt,
                routine_type: "compulsory",
                difficulty: null,
                completed_count: completedCount("compulsory"),
            },
            ...optionalRoutines.map((routine) => ({
                athlete_id: Number(athleteId),
                recorded_at: recordedAt,
                routine_type: "optional",
                difficulty: routine.difficulty,
                completed_count: completedCount(routine.planItemName),
            })),
        ];

        const { error: progressError } = await supabase
            .from("routine_progress")
            .insert(progressRows);

        if (progressError) {
            alert(progressError.message);
            return;
        }

        const { error } = await supabase
            .from("training_logs")
            .update({
                completed: false,
                comments: "",
            })
            .eq("athlete_id", Number(athleteId));

        if (error) {
            alert(error.message);
            return;
        }

        setCheckedItems([]);
        setComments("");

        alert("Training submitted!");
    }

    return (
        <>
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                {planItems.length > 0 ? (
                    <div className="divide-y divide-zinc-100">
                        {planItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={checkedItems.includes(item.id)}
                                        onChange={() => toggleItem(item.id)}
                                        className="h-4 w-4 accent-red-600"
                                    />

                                    <span className="text-black">
                                        {item.name}
                                    </span>
                                </div>

                                <span className="text-lg font-semibold text-black">
                                    {item.target ?? "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-black">No plan available.</p>
                )}
            </div>

            <input
                type="text"
                placeholder="Enter comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="mt-4 h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-black outline-none focus:ring-2 focus:ring-red-500"
            />

            <button
                type="button"
                onClick={handleSubmit}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800"
            >
                Submit
            </button>
        </>
    );
}
