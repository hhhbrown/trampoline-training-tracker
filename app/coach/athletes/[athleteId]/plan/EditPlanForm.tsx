"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";

type EditPlanFormProps = {
    coachId: string;
    athleteId: string;
    planItems: PlanItem[];
    planId: number;
};

type PlanItem = {
    id: number;
    name: string | null;
    target: number | null;
};

type EditablePlanItem = PlanItem & {
    isNew?: boolean;
};

export default function EditPlanForm({
    coachId,
    athleteId,
    planItems,
    planId,
}: EditPlanFormProps) {
    const [items, setItems] = useState<EditablePlanItem[]>(planItems);
    const [deletedIds, setDeletedIds] = useState<number[]>([]);
    const router = useRouter();

    function addRow() {
        setItems([
            ...items,
            {
                id: Date.now(),
                name: "",
                target: null,
                isNew: true,
            },
        ]);
    }

    function deleteRow(item: EditablePlanItem) {
        setItems(items.filter((currentItem) => currentItem.id !== item.id));

        if (!item.isNew) {
            setDeletedIds([...deletedIds, item.id]);
        }
    }

    async function handleSave() {
        const supabase = createClient();

        for (const id of deletedIds) {
            const { error } = await supabase
                .from("plan_items")
                .delete()
                .eq("id", id);

            if (error) {
                alert(`Error deleting row: ${error.message}`);
                return;
            }
        }

        for (const item of items) {
            if (item.isNew) {
                const { error } = await supabase.from("plan_items").insert({
                    plan_id: planId,
                    name: item.name,
                    target: item.target,
                });

                if (error) {
                    alert(`Error adding ${item.name}: ${error.message}`);
                    return;
                }
            } else {
                const { error } = await supabase
                    .from("plan_items")
                    .update({
                        name: item.name,
                        target: item.target,
                    })
                    .eq("id", item.id);

                if (error) {
                    alert(`Error saving ${item.name}: ${error.message}`);
                    return;
                }
            }
        }

        alert("Plan saved!");
        router.push(`/coach/${coachId}/athletes`);
    }

    return (
        <section className="mt-10">
            <BackLink
                href={`/coach/${coachId}/athletes`}
            >
                Back
            </BackLink>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black">Daily Plan</h2>

                <button
                    type="button"
                    onClick={addRow}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black font-medium text-black hover:bg-zinc-100"
                >
                    + Add Row
                </button>
            </div>

            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-[1fr_80px_auto] items-center gap-3 border-b border-zinc-100 pb-3"
                        >
                            <input
                                value={item.name ?? ""}
                                placeholder="Turn"
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].name = e.target.value;
                                    setItems(newItems);
                                }}
                                className="rounded border px-2 py-1 text-black"
                            />

                            <input
                                type="number"
                                value={item.target ?? ""}
                                placeholder="0"
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].target =
                                        e.target.value === "" ? null : Number(e.target.value);
                                    setItems(newItems);
                                }}
                                className="rounded border px-2 py-1 text-right text-black"
                            />

                            <button
                                type="button"
                                onClick={() => deleteRow(item)}
                                className="rounded border border-red-200 px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={handleSave}
                className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
                Save Plan
            </button>
        </section>
    );
}
