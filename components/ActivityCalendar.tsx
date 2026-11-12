"use client";

import { useState } from "react";

type RoutineRecord = {
    id: number;
    recorded_at: string;
    routine_type: string;
    difficulty: number | null;
    completed_count: number;
};

type BounceRecord = {
    id: number;
    recorded_at: string;
    difficulty: number;
    notes: string | null;
};

export function trainingDateKey(timestamp: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date(timestamp));
    return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}

function dateLabel(key: string, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("en-CA", { ...options, timeZone: "UTC" }).format(new Date(`${key}T12:00:00Z`));
}

export default function ActivityCalendar({ progress, tenBounceRecords, today }: {
    progress: RoutineRecord[];
    tenBounceRecords: BounceRecord[];
    today: string;
}) {
    const [month, setMonth] = useState(today.slice(0, 7));
    const [selected, setSelected] = useState(today);
    const [year, monthNumber] = month.split("-").map(Number);
    const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
    const routinesByDay = new Map<string, RoutineRecord[]>();
    const bouncesByDay = new Map<string, BounceRecord[]>();
    for (const entry of progress) {
        const key = trainingDateKey(entry.recorded_at);
        routinesByDay.set(key, [...(routinesByDay.get(key) ?? []), entry]);
    }
    for (const entry of tenBounceRecords) {
        const key = trainingDateKey(entry.recorded_at);
        bouncesByDay.set(key, [...(bouncesByDay.get(key) ?? []), entry]);
    }
    const routines = routinesByDay.get(selected) ?? [];
    const bounces = bouncesByDay.get(selected) ?? [];
    const hasLogs = routines.length > 0 || bounces.length > 0;
    const completed = (type: string) => routines.filter((entry) => entry.routine_type === type).reduce((sum, entry) => sum + entry.completed_count, 0);

    function moveMonth(offset: number) {
        const next = new Date(Date.UTC(year, monthNumber - 1 + offset, 1));
        const key = next.toISOString().slice(0, 10);
        setMonth(key.slice(0, 7));
        setSelected(key);
    }

    const buttonStyle = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2";

    return (
        <section aria-labelledby="activity-calendar-heading" className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 id="activity-calendar-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">Recent activity</h2>
            <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)]">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 aria-live="polite" className="text-lg font-bold text-zinc-950">{dateLabel(`${month}-01`, { month: "long", year: "numeric" })}</h3>
                        <div className="flex gap-2">
                            <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className={buttonStyle}>←</button>
                            <button type="button" onClick={() => { setMonth(today.slice(0, 7)); setSelected(today); }} className={buttonStyle}>Today</button>
                            <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className={buttonStyle}>→</button>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <span key={day} className="py-2 text-center text-xs font-semibold text-zinc-600">{day}</span>
                        ))}
                        {Array.from({ length: firstDay }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
                        {Array.from({ length: days }, (_, index) => {
                            const day = index + 1;
                            const key = `${month}-${String(day).padStart(2, "0")}`;
                            const submitted = routinesByDay.has(key) || bouncesByDay.has(key);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    aria-label={`${dateLabel(key, { month: "long", day: "numeric", year: "numeric" })}${submitted ? ", log submitted" : ", no log"}`}
                                    aria-pressed={selected === key}
                                    aria-current={key === today ? "date" : undefined}
                                    onClick={() => setSelected(key)}
                                    className={`relative flex min-h-11 items-center justify-center rounded-xl py-3 text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 ${selected === key ? "ring-2 ring-red-700 ring-offset-2" : ""} ${submitted ? "bg-red-700 text-white hover:bg-red-800" : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100"}`}
                                >
                                    {day}
                                    {submitted && <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-5 flex items-center gap-2 text-sm text-zinc-600"><span aria-hidden="true" className="h-3 w-3 rounded bg-red-700" />Log submitted</p>
                </div>
                <div aria-live="polite" className="min-w-0 rounded-2xl border border-red-100 bg-red-50/50 p-5">
                    <h3 className="text-lg font-bold text-zinc-950">{dateLabel(selected, { weekday: "short", month: "long", day: "numeric" })}</h3>
                    {hasLogs ? (
                        <>
                            <dl className="mt-5 grid grid-cols-2 gap-4">
                                <div><dt className="text-sm text-zinc-600">Compulsories</dt><dd className="mt-1 text-3xl font-bold text-red-700">{completed("compulsory")}</dd></div>
                                <div><dt className="text-sm text-zinc-600">Optionals</dt><dd className="mt-1 text-3xl font-bold text-red-700">{completed("optional")}</dd></div>
                            </dl>
                            <ul className="mt-5 space-y-3">
                                {[...routines].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at) || a.id - b.id).map((entry) => (
                                    <li key={entry.id} className="rounded-xl bg-white p-3 text-sm leading-6 text-zinc-800">
                                        <time dateTime={entry.recorded_at} className="block text-xs text-zinc-500">{new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", hour: "numeric", minute: "2-digit" }).format(new Date(entry.recorded_at))}</time>
                                        <span className="font-semibold capitalize">{entry.completed_count} × {entry.routine_type}</span>
                                        {entry.difficulty != null && ` · DD ${entry.difficulty.toFixed(2)}`}
                                    </li>
                                ))}
                                {bounces.map((entry) => (
                                    <li key={`bounce-${entry.id}`} className="rounded-xl bg-white p-3 text-sm leading-6 text-zinc-800">
                                        <p>{entry.difficulty.toFixed(3)} second 10-bounce</p>
                                        {entry.notes && <p className="mt-2 whitespace-pre-line break-words">{entry.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : <p className="mt-4 text-sm leading-6 text-zinc-600">No training log submitted on this date.</p>}
                </div>
            </div>
        </section>
    );
}
