"use client";

import { competesInEvent } from "@/lib/athlete-events";
import { useState } from "react";
import { calculateDD, type DDLookupEntry } from "@/lib/dd";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";

type EditRoutinesFormProps = {
    coachId: string;
    athleteId: string;
    athleteName: string;
    dmtLevel: string | null;
    ddLookup: DDLookupEntry[];
    ddLookupError?: string;
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
        skills: string | null;
        notes: string | null;
    } | null;
};

export default function EditRoutinesForm({
    coachId,
    athleteId,
    athleteName,
    dmtLevel,
    routines,
    ddLookup,
    ddLookupError,
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
    const [optionalADifficulty, setOptionalADifficulty] = useState<string | null>(() => {
        const saved = routines?.optional_a_difficulty;
        const calculated = calculateDD(routines?.optional_a ?? "", ddLookup).total;
        return saved != null && (ddLookupError || saved !== calculated) ? String(saved) : null;
    });
    const [optionalB, setOptionalB] = useState(routines?.optional_b ?? "");
    const [optionalBDifficulty, setOptionalBDifficulty] = useState<string | null>(() => {
        const saved = routines?.optional_b_difficulty;
        const calculated = calculateDD(routines?.optional_b ?? "", ddLookup).total;
        return saved != null && (ddLookupError || saved !== calculated) ? String(saved) : null;
    });
    const calculationA = calculateDD(optionalA, ddLookup);
    const calculationB = calculateDD(optionalB, ddLookup);
    const effectiveA = optionalADifficulty ?? (ddLookupError ? "" : calculationA.total?.toFixed(2) ?? "");
    const effectiveB = optionalBDifficulty ?? (ddLookupError ? "" : calculationB.total?.toFixed(2) ?? "");
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
    const [skills, setSkills] = useState(routines?.skills ?? "");
    const [notes, setNotes] = useState(routines?.notes ?? "");

    async function handleSave() {
        if ([effectiveA, effectiveB, doubleMiniSetADifficulty, doubleMiniSetBDifficulty].some((value) => value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0))) {
            alert("Enter a valid DD of 0 or more.");
            return;
        }
        if (ddLookupError && ((optionalA.trim() && effectiveA === "") || (optionalB.trim() && effectiveB === ""))) {
            alert("Automatic DD calculation is unavailable. Enter DD manually before saving.");
            return;
        }
        const supabase = createClient();

        const payload = {
            athlete_id: Number(athleteId),
            compulsory,
            custom_compulsory:
                compulsory === "Level 5+" ? customCompulsory.trim() || null : null,
            optional_a: optionalA,
            optional_a_difficulty:
                effectiveA === "" ? null : Number(effectiveA),
            optional_b: optionalB,
            optional_b_difficulty:
                effectiveB === "" ? null : Number(effectiveB),
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
            skills,
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

    const fieldStyle = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base leading-6 text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-700";

    return (
        <section className="mt-6">
            <BackLink href={`/coach/${coachId}/athletes`}>Back</BackLink>
            <h2 className="break-words text-2xl font-bold text-zinc-950">{athleteName}</h2>

            <div className="mt-6 space-y-7">
                <section aria-labelledby="trampoline-edit-heading">
                    <h3 id="trampoline-edit-heading" className="mb-3 text-xl font-bold text-red-900">Trampoline</h3>
                    <div className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
                        <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                            <label htmlFor="routine-compulsory" className="text-base font-bold text-red-900">Compulsory</label>
                        </div>
                        <div className="p-4">
                        <select id="routine-compulsory" value={compulsory} onChange={(e) => setCompulsory(e.target.value)} className={fieldStyle}>
                            <option value="">Select Level</option>
                            {compulsoryOptions.map((routine) => <option key={routine} value={routine}>{routine}</option>)}
                        </select>
                        {compulsory === "Level 5+" && (
                            <div className="mt-4">
                                <label htmlFor="routine-custom-compulsory" className="mb-2 block text-sm font-semibold text-zinc-700">Custom Compulsory</label>
                                <textarea id="routine-custom-compulsory" value={customCompulsory} onChange={(e) => setCustomCompulsory(e.target.value)} placeholder="One skill per line" rows={10} className={fieldStyle} />
                            </div>
                        )}
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <RoutineEditor id="optional-a" title="Optional A" value={optionalA} onChange={setOptionalA} difficulty={effectiveA} onDifficultyChange={(value) => setOptionalADifficulty(value === "" ? null : value)} calculation={calculationA} manual={optionalADifficulty !== null} onUseCalculated={() => setOptionalADifficulty(null)} calculationError={ddLookupError} rows={Math.max(10, optionalA.split("\n").length)} />
                        <RoutineEditor id="optional-b" title="Optional B" value={optionalB} onChange={setOptionalB} difficulty={effectiveB} onDifficultyChange={(value) => setOptionalBDifficulty(value === "" ? null : value)} calculation={calculationB} manual={optionalBDifficulty !== null} onUseCalculated={() => setOptionalBDifficulty(null)} calculationError={ddLookupError} rows={Math.max(10, optionalB.split("\n").length)} />
                    </div>
                </section>

                {competesInEvent(dmtLevel) && (
                <section aria-labelledby="double-mini-edit-heading">
                    <h3 id="double-mini-edit-heading" className="mb-3 text-xl font-bold text-red-900">Double Mini</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <RoutineEditor id="double-mini-a" title="Set A" value={doubleMiniSetA} onChange={setDoubleMiniSetA} difficulty={doubleMiniSetADifficulty} onDifficultyChange={setDoubleMiniSetADifficulty} rows={4} />
                        <RoutineEditor id="double-mini-b" title="Set B" value={doubleMiniSetB} onChange={setDoubleMiniSetB} difficulty={doubleMiniSetBDifficulty} onDifficultyChange={setDoubleMiniSetBDifficulty} rows={4} />
                    </div>
                </section>
                )}

                <section aria-labelledby="skills-edit-heading">
                    <h3 id="skills-edit-heading" className="mb-3 text-xl font-bold text-red-900">Skills & Notes</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <RoutineEditor id="skills" title="Skills" value={skills} onChange={setSkills} />
                        <RoutineEditor id="notes" title="Notes" value={notes} onChange={setNotes} placeholder="Coaching notes" />
                    </div>
                </section>
            </div>

            <button type="button" onClick={handleSave} className="mt-6 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">
                Save Routines
            </button>
        </section>
    );
}

function RoutineEditor({ id, title, value, onChange, difficulty, onDifficultyChange, calculation, manual, onUseCalculated, calculationError, rows = 6, placeholder = "One skill per line" }: {
    id: string;
    title: string;
    value: string;
    onChange: (value: string) => void;
    difficulty?: string;
    onDifficultyChange?: (value: string) => void;
    calculation?: ReturnType<typeof calculateDD>;
    manual?: boolean;
    onUseCalculated?: () => void;
    calculationError?: string;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <div className="min-w-0 overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                <label htmlFor={`routine-${id}`} className="text-base font-bold text-red-900">{title}</label>
            </div>
            <div className="p-4">
                <textarea id={`routine-${id}`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={calculation ? "One skill per line, or separate with commas" : placeholder} rows={rows} className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base leading-7 text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-700" />
                {calculation && (
                    <div aria-live="polite" className="mt-3 space-y-2 text-sm leading-6">
                        {calculationError ? <p role="alert" className="text-amber-900">{calculationError}</p> : (
                            <>
                                <p className="font-semibold text-zinc-700">Calculated DD: {calculation.total?.toFixed(2) ?? "—"}{calculation.unmatched.length > 0 ? " (matched skills only)" : ""}</p>
                                {calculation.unmatched.map((skill) => <p key={skill} className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">Calculation done, please note no match was found in our database for skill {skill}.</p>)}
                            </>
                        )}
                        {calculation.repeated.map((skill) => <p key={skill} className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">Repeated skill: {skill}. DD includes every occurrence.</p>)}
                    </div>
                )}
                {onDifficultyChange && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-red-50 p-3">
                        <label htmlFor={`routine-${id}-dd`} className="flex-1 text-sm font-semibold text-red-900">{calculation ? (manual ? "DD · Manual override" : "DD · Calculated") : "Degree of Difficulty"}</label>
                        <input id={`routine-${id}-dd`} type="number" min="0" step="0.01" value={difficulty ?? ""} onChange={(event) => onDifficultyChange(event.target.value)} placeholder="0.00" className="w-24 rounded-lg border border-red-200 bg-white px-2 py-2 text-center text-base font-bold tabular-nums text-red-900 focus:outline-none focus:ring-2 focus:ring-red-700" />
                    </div>
                )}
                {calculation && manual && !calculationError && (
                    <button type="button" onClick={onUseCalculated} className="mt-2 rounded text-sm font-semibold text-red-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">Use calculated DD</button>
                )}
            </div>
        </div>
    );
}
