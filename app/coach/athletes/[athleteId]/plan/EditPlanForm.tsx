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
    planItems,
    planId,
}: EditPlanFormProps) {
    const [items, setItems] = useState<EditablePlanItem[]>(planItems);
    const [deletedIds, setDeletedIds] = useState<number[]>([]);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const router = useRouter();

    function moveRow(id: number, targetId: number) {
        setItems((current) => {
            const from = current.findIndex((item) => item.id === id);
            const to = current.findIndex((item) => item.id === targetId);
            if (from < 0 || to < 0 || from === to) return current;
            const reordered = [...current];
            const [row] = reordered.splice(from, 1);
            reordered.splice(to, 0, row);
            return reordered;
        });
    }

    function addRow() {
        setItems([
            ...items,
            {
                id: Date.now(),
                name: "",
                target: 1,
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
        if (items.some((item) => !Number.isInteger(item.target) || (item.target ?? 0) < 1)) {
            alert("Enter a whole-number turn count of 1 or more for every row.");
            return;
        }

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

        for (const [position, item] of items.entries()) {
            if (item.isNew) {
                const { error } = await supabase.from("plan_items").insert({
                    plan_id: planId,
                    name: item.name,
                    target: item.target,
                    sort_order: position,
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
                        sort_order: position,
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
        <section className="mt-8" aria-labelledby="edit-plan-heading">
            <BackLink href={`/coach/${coachId}/athletes`}>Back</BackLink>
            <div className="flex items-center justify-between gap-3">
                <h2 id="edit-plan-heading" className="text-xl font-semibold text-zinc-950">Daily Plan</h2>
                <button type="button" onClick={addRow} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">
                    + Add Row
                </button>
            </div>

            <p id="reorder-help" className="mt-3 text-xs text-zinc-600">Drag the handles to reorder, or focus a handle and use the arrow keys. Save Plan to keep the order.</p>
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                <div aria-hidden="true" className="mb-2 grid grid-cols-[28px_minmax(0,1fr)_60px_52px] gap-2 text-xs font-semibold text-zinc-600 sm:grid-cols-[32px_minmax(0,1fr)_80px_64px] sm:gap-3">
                    <span />
                    <span>Turn</span>
                    <span className="text-center">Count</span>
                    <span />
                </div>
                <div className="divide-y divide-zinc-100">
                    {items.length === 0 && <p className="py-3 text-sm text-zinc-600">No turns added yet.</p>}
                    {items.map((item, index) => (
                        <div key={item.id} data-plan-row={item.id} className="grid grid-cols-[28px_minmax(0,1fr)_60px_52px] items-center gap-2 py-2 sm:grid-cols-[32px_minmax(0,1fr)_80px_64px] sm:gap-3">
                            <button
                                type="button"
                                aria-label={`Reorder row ${index + 1}: ${item.name || "Untitled turn"}`}
                                aria-describedby="reorder-help"
                                onPointerDown={(event) => {
                                    if (event.button !== 0) return;
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    setDraggedId(item.id);
                                }}
                                onPointerMove={(event) => {
                                    if (draggedId !== item.id) return;
                                    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-plan-row]");
                                    if (row?.dataset.planRow) moveRow(item.id, Number(row.dataset.planRow));
                                }}
                                onPointerUp={() => setDraggedId(null)}
                                onPointerCancel={() => setDraggedId(null)}
                                onLostPointerCapture={() => setDraggedId(null)}
                                onKeyDown={(event) => {
                                    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                                    event.preventDefault();
                                    const target = items[index + (event.key === "ArrowUp" ? -1 : 1)];
                                    if (target) moveRow(item.id, target.id);
                                }}
                                className={`touch-none rounded py-2 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${draggedId === item.id ? "cursor-grabbing bg-red-100 text-red-800" : "cursor-grab text-zinc-500 hover:bg-red-50 hover:text-red-700"}`}
                            >
                                <span aria-hidden="true">⠿</span>
                            </button>
                            <input
                                aria-label={`Row ${index + 1} assignment`}
                                value={item.name ?? ""}
                                placeholder="Turn"
                                onChange={(e) => setItems(items.map((current) => current.id === item.id ? { ...current, name: e.target.value } : current))}
                                className="min-w-0 w-full rounded-lg border border-zinc-300 px-2 py-2 text-sm text-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <input
                                aria-label={`Row ${index + 1} turn count`}
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={item.target ?? ""}
                                placeholder="1"
                                onChange={(e) => {
                                    const target = e.target.value === "" ? null : Number(e.target.value);
                                    setItems(items.map((current) => current.id === item.id ? { ...current, target } : current));
                                }}
                                className="min-w-0 w-full rounded-lg border border-zinc-300 px-2 py-2 text-center text-sm font-semibold tabular-nums text-zinc-950 focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <button type="button" aria-label={`Delete row ${index + 1}`} onClick={() => deleteRow(item)} className="rounded-lg border border-red-200 px-2 py-2 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button type="button" onClick={handleSave} className="mt-5 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">
                Save Plan
            </button>
        </section>
    );
}
