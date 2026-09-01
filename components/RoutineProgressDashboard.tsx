type RoutineProgress = {
    id: number;
    recorded_at: string;
    routine_type: string;
    difficulty: number | null;
    completed_count: number;
};

type TenBounceRecord = {
    id: number;
    recorded_at: string;
    difficulty: number;
    notes: string | null;
};

export default function RoutineProgressDashboard({
    progress,
    tenBounceRecords,
}: {
    progress: RoutineProgress[];
    tenBounceRecords: TenBounceRecord[];
}) {
    const compulsoryTotal = totalFor(progress, "compulsory");
    const optional = progress.filter((entry) => entry.routine_type === "optional");
    const optionalTotal = totalFor(progress, "optional");
    const total = compulsoryTotal + optionalTotal;
    const difficulties = optional
        .map((entry) => entry.difficulty)
        .filter((value): value is number => value != null);
    const averageDd = difficulties.length
        ? difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length
        : null;
    const optionalPercent = total ? Math.round((optionalTotal / total) * 100) : 0;
    const activity = getWeeklyActivity(progress);
    const peak = Math.max(...activity.map((day) => day.count), 1);
    const personalBest = tenBounceRecords.length
        ? Math.min(...tenBounceRecords.map((entry) => entry.difficulty))
        : null;

    return (
        <div className="mt-7 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard featured label="Total completions" value={total} note={`${progress.length} progress records`} />
                <MetricCard label="Compulsory" value={compulsoryTotal} note="Completed routines" />
                <MetricCard label="Optional" value={optionalTotal} note="Completed routines" />
                <MetricCard label="Average DD" value={averageDd?.toFixed(2) ?? "—"} note="Across optional records" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                    <PanelHeading title="Weekly activity" subtitle="Routine completions over the last 7 days" />

                    <div className="mt-8 flex h-64 items-end gap-3 border-b border-zinc-100 sm:gap-5">
                        {activity.map((day, index) => (
                            <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" title={`${day.date}: ${day.count}`}>
                                <span className="mb-2 text-xs font-semibold text-zinc-700">{day.count}</span>
                                <div
                                    className={`w-full max-w-14 rounded-t-2xl ${index % 2 ? "bg-red-700" : "bg-red-400"}`}
                                    style={{ height: `${Math.max(day.count ? (day.count / peak) * 78 : 3, 3)}%` }}
                                />
                                <span className="mt-3 pb-3 text-sm font-medium text-zinc-500">{day.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex justify-between text-sm text-zinc-500">
                        <span>Total: <strong className="text-zinc-950">{activity.reduce((sum, day) => sum + day.count, 0)}</strong></span>
                        <span>Peak: <strong className="text-red-700">{Math.max(...activity.map((day) => day.count))}</strong></span>
                    </div>
                </section>

                <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                    <PanelHeading title="Routine mix" subtitle="Optional share of all completions" />
                    <div className="flex min-h-64 items-center justify-center">
                        <div
                            className="grid h-44 w-44 place-items-center rounded-full"
                            style={{ background: `conic-gradient(rgb(185 28 28) 0 ${optionalPercent}%, rgb(254 202 202) ${optionalPercent}% 100%)` }}
                        >
                            <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center">
                                <div>
                                    <p className="text-4xl font-bold text-zinc-950">{optionalPercent}%</p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">Optional</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Legend color="bg-red-200" label="Compulsory" value={compulsoryTotal} />
                        <Legend color="bg-red-700" label="Optional" value={optionalTotal} />
                    </div>
                </section>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <TenBounceChart data={tenBounceRecords} />
                <section className="flex min-h-80 flex-col justify-between rounded-[28px] border border-zinc-900 bg-zinc-950 p-7 text-white shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Personal best</p>
                            <h3 className="mt-1 text-xl font-bold">10-bounce PB</h3>
                        </div>
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-xl">↘</span>
                    </div>
                    <div>
                        <p className="text-5xl font-bold tracking-tight">
                            {personalBest?.toFixed(3) ?? "—"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                            {personalBest == null ? "No time recorded yet" : "seconds"}
                        </p>
                    </div>
                    <p className="text-sm text-zinc-400">
                        Based on {tenBounceRecords.length} recorded {tenBounceRecords.length === 1 ? "time" : "times"}
                    </p>
                </section>
            </div>

            <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
                <div className="px-5 py-5 sm:px-7">
                    <PanelHeading title="Recent activity" subtitle="Every routine record, newest first" />
                </div>
                {progress.length ? <ProgressTable progress={progress} /> : (
                    <p className="border-t border-zinc-100 px-7 py-10 text-sm text-zinc-500">No routine progress has been submitted yet.</p>
                )}
            </section>
        </div>
    );
}

function TenBounceChart({ data }: { data: TenBounceRecord[] }) {
    const points = data.slice(-12);

    if (points.length === 0) {
        return (
            <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                <PanelHeading
                    title="10-Bounce Progress"
                    subtitle="Recorded times in seconds"
                />
                <div className="grid min-h-64 place-items-center text-sm text-zinc-500">
                    No 10-bounce times recorded yet.
                </div>
            </section>
        );
    }

    const values = points.map((entry) => entry.difficulty);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = maximum - minimum || 1;
    const coordinates = points.map((entry, index) => ({
        x: points.length === 1 ? 300 : 35 + (index / (points.length - 1)) * 530,
        y: 175 - ((entry.difficulty - minimum) / range) * 130,
        entry,
    }));

    return (
        <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
            <PanelHeading
                title="10-bounce over time"
                subtitle="Last 12 recorded times in seconds · lower is faster"
            />
            <div className="mt-6 overflow-hidden">
                <svg
                    viewBox="0 0 600 220"
                    role="img"
                    aria-label="10-bounce times over time"
                    className="h-64 w-full"
                >
                    {[45, 110, 175].map((y) => (
                        <line
                            key={y}
                            x1="30"
                            x2="575"
                            y1={y}
                            y2={y}
                            stroke="rgb(228 228 231)"
                            strokeDasharray="5 7"
                        />
                    ))}
                    {coordinates.length > 1 && (
                        <polyline
                            points={coordinates.map(({ x, y }) => `${x},${y}`).join(" ")}
                            fill="none"
                            stroke="rgb(185 28 28)"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                    {coordinates.map(({ x, y, entry }) => (
                        <g key={entry.id}>
                            <circle cx={x} cy={y} r="7" fill="white" stroke="rgb(185 28 28)" strokeWidth="4" />
                            <text x={x} y={y - 14} textAnchor="middle" className="fill-zinc-700 text-[12px] font-semibold">
                                {entry.difficulty.toFixed(3)}
                            </text>
                        </g>
                    ))}
                    <text x="35" y="210" className="fill-zinc-500 text-[12px]">
                        {formatShortDate(points[0].recorded_at)}
                    </text>
                    <text x="565" y="210" textAnchor="end" className="fill-zinc-500 text-[12px]">
                        {formatShortDate(points[points.length - 1].recorded_at)}
                    </text>
                </svg>
            </div>
        </section>
    );
}

function MetricCard({ label, value, note, featured = false }: { label: string; value: string | number; note: string; featured?: boolean }) {
    return (
        <div className={`flex min-h-48 flex-col justify-between rounded-[28px] border p-6 shadow-sm ${featured ? "border-red-700 bg-red-700 text-white" : "border-zinc-200 bg-white text-zinc-950"}`}>
            <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${featured ? "text-red-100" : "text-zinc-600"}`}>{label}</p>
                <span className={`grid h-9 w-9 place-items-center rounded-full text-lg ${featured ? "bg-white/15" : "bg-red-700 text-white"}`}>↗</span>
            </div>
            <p className="text-5xl font-bold tracking-tight">{value}</p>
            <p className={`text-sm ${featured ? "text-red-100" : "text-zinc-500"}`}>{note}</p>
        </div>
    );
}

function PanelHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return <div><h3 className="text-xl font-bold text-zinc-950">{title}</h3><p className="mt-1 text-sm text-zinc-500">{subtitle}</p></div>;
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
    return (
        <div className="rounded-2xl bg-zinc-50 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</div>
            <p className="mt-2 text-xl font-bold text-zinc-950">{value}</p>
        </div>
    );
}

function ProgressTable({ progress }: { progress: RoutineProgress[] }) {
    return (
        <div className="overflow-x-auto border-t border-zinc-100">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500"><tr><th className="px-5 py-3 font-medium sm:px-7">Date</th><th className="px-5 py-3 font-medium">Routine</th><th className="px-5 py-3 font-medium">DD</th><th className="px-5 py-3 text-right font-medium sm:px-7">Completed</th></tr></thead>
                <tbody className="divide-y divide-zinc-100">
                    {progress.map((entry) => (
                        <tr key={entry.id} className="hover:bg-zinc-50/80">
                            <td className="whitespace-nowrap px-5 py-4 text-zinc-600 sm:px-7">{formatDate(entry.recorded_at)}</td>
                            <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${entry.routine_type === "optional" ? "bg-red-100 text-red-800" : "bg-zinc-100 text-zinc-700"}`}>{entry.routine_type}</span></td>
                            <td className="px-5 py-4 text-zinc-600">{entry.difficulty ?? "—"}</td>
                            <td className="px-5 py-4 text-right text-lg font-bold text-zinc-950 sm:px-7">{entry.completed_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function totalFor(progress: RoutineProgress[], type: string) {
    return progress.filter((entry) => entry.routine_type === type).reduce((sum, entry) => sum + entry.completed_count, 0);
}

function getWeeklyActivity(progress: RoutineProgress[]) {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        const count = progress.filter((entry) => sameDay(new Date(entry.recorded_at), date)).reduce((sum, entry) => sum + entry.completed_count, 0);
        return { label: new Intl.DateTimeFormat("en-CA", { weekday: "narrow" }).format(date), date: new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(date), count };
    });
}

function sameDay(left: Date, right: Date) {
    return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatShortDate(value: string) {
    return new Intl.DateTimeFormat("en-CA", {
        month: "short",
        day: "numeric",
    }).format(new Date(value));
}
