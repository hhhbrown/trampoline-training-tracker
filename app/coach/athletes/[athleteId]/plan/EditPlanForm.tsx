"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PlanItem = {
    id: number;
    name: string | null;
    target: number | null;
};

export default function EditPlanForm({ planItems }: { planItems: PlanItem[] }) {
    const [items, setItems] = useState(planItems);

    async function handleSave() {
        const supabase = createClient();

        for (const item of items) {
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

        alert("Plan saved!");
    }

    return (
        <section className="mt-10">
            <h2 className="text-xl font-semibold text-black">Daily Plan</h2>

            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 border-b border-zinc-100 pb-3"
                        >
                            <input
                                value={item.name ?? ""}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].name = e.target.value;
                                    setItems(newItems);
                                }}
                                className="flex-1 rounded border px-2 py-1 text-sm"
                            />

                            <input
                                type="number"
                                value={item.target ?? ""}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].target = Number(e.target.value);
                                    setItems(newItems);
                                }}
                                className="w-20 rounded border px-2 py-1 text-right text-sm"
                            />
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