"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    coachId,
    athleteId,
    planItems,
    initialCheckedItems,
    initialComments,
    optionalRoutines,
}: {
    coachId: string;
    athleteId: string;
    planItems: PlanItem[];
    initialCheckedItems: number[];
    initialComments: string;
    optionalRoutines: OptionalRoutine[];
}) {
    const [checkedItems, setCheckedItems] = useState<number[]>(initialCheckedItems);
    const [comments, setComments] = useState(initialComments);
    const [tenBounceSeconds, setTenBounceSeconds] = useState("");
    const router = useRouter();

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
            checkedPlanItems.filter((item) => {
                const name = item.name ?? "";

                if (planItemName === "compulsory") {
                    return /\bcompulsory\b/i.test(name);
                }

                const optional = name.match(/\boptionals?\b(?:\s+([ab])\b)?/i);
                if (!optional) return false;

                const routineName = optional[1]
                    ? `optional ${optional[1].toLowerCase()}`
                    : "optional";
                return routineName === planItemName;
            }).length;

        const genericOptionalCount = completedCount("optional");
        const tenBounceValue =
            tenBounceSeconds.trim() === "" ? null : Number(tenBounceSeconds);

        if (
            tenBounceValue != null &&
            (!Number.isFinite(tenBounceValue) || tenBounceValue <= 0)
        ) {
            alert("Enter a valid 10-bounce time greater than 0.");
            return;
        }

        const recordedAt = new Date().toISOString();
        const progressRows = [
            {
                athlete_id: Number(athleteId),
                recorded_at: recordedAt,
                routine_type: "compulsory",
                difficulty: null,
                completed_count: completedCount("compulsory"),
            },
            ...optionalRoutines.map((routine, index) => ({
                athlete_id: Number(athleteId),
                recorded_at: recordedAt,
                routine_type: "optional",
                difficulty: routine.difficulty,
                completed_count:
                    completedCount(routine.planItemName) +
                    (index === 0 ? genericOptionalCount : 0),
            })),
        ];

        const { error: progressError } = await supabase
            .from("routine_progress")
            .insert(progressRows);

        if (progressError) {
            alert(progressError.message);
            return;
        }

        if (tenBounceValue != null) {
            const { error: tenBounceError } = await supabase
                .from("ten_bounce_records")
                .insert({
                    athlete_id: Number(athleteId),
                    recorded_at: recordedAt,
                    difficulty: tenBounceValue,
                    notes: comments.trim() || null,
                });

            if (tenBounceError) {
                alert(tenBounceError.message);
                return;
            }
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
        setTenBounceSeconds("");

        alert("Training submitted!");
        router.push(`/athletes/${coachId}/${athleteId}/progress`);
    }

    const completedItems = planItems.filter((item) => checkedItems.includes(item.id)).length;

    return (
        <div className="space-y-6">
            <section aria-labelledby="turns-heading" className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-5 sm:px-6">
                    <h2 id="turns-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950">Turns</h2>
                    <span aria-live="polite" className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold tabular-nums text-red-800">
                        {completedItems} of {planItems.length} completed
                    </span>
                </div>
                {planItems.length > 0 ? (
                    <ul className="divide-y divide-zinc-100">
                        {planItems.map((item) => {
                            const checked = checkedItems.includes(item.id);
                            return (
                                <li key={item.id}>
                                    <label className={`flex min-h-20 cursor-pointer items-center gap-4 px-5 py-4 transition focus-within:ring-2 focus-within:ring-inset focus-within:ring-red-700 sm:px-6 ${checked ? "bg-red-50/60" : "hover:bg-zinc-50"}`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleItem(item.id)}
                                            className="h-6 w-6 shrink-0 accent-red-700"
                                        />
                                        <span className="min-w-0 flex-1 break-words text-lg font-semibold leading-7 text-zinc-950">{item.name || "Untitled turn"}</span>
                                        <span className="flex min-w-16 shrink-0 flex-col items-center rounded-xl bg-red-100 px-3 py-2 text-red-900">
                                            <span className="text-2xl font-bold tabular-nums">{item.target ?? "—"}</span>
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="px-6 py-8 text-base text-zinc-600">No plan available.</p>
                )}
            </section>

            <section aria-labelledby="notes-heading" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 id="notes-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950">
                    <label htmlFor="training-comments">Training notes</label>
                </h2>
                <textarea
                    id="training-comments"
                    placeholder="Add a note about your session (optional)"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base leading-7 text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
            </section>

            <section aria-labelledby="bounce-heading" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 id="bounce-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950">
                        <label htmlFor="ten-bounce-seconds">10-bounce time</label>
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">Optional</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <input
                        id="ten-bounce-seconds"
                        type="number"
                        min="0.001"
                        step="0.001"
                        inputMode="decimal"
                        placeholder="e.g. 16.420"
                        value={tenBounceSeconds}
                        onChange={(event) => setTenBounceSeconds(event.target.value)}
                        aria-describedby="bounce-units"
                        className="h-14 w-full max-w-64 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg tabular-nums text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                    <span id="bounce-units" className="text-base font-medium text-zinc-600">seconds</span>
                </div>
            </section>

            <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-red-700 px-6 py-3 text-lg font-bold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-4"
            >
                Submit training
            </button>
        </div>
    );
}
