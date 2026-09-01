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
    const activity = getWeeklyActivity(progress);
    const peak = Math.max(
        ...activity.flatMap((day) => [day.compulsory, day.optional]),
        1
    );
    const personalBest = tenBounceRecords.length
        ? Math.min(...tenBounceRecords.map((entry) => entry.difficulty))
        : null;
    const latestRecordedAt = progress[0]?.recorded_at;
    const latestProgress = latestRecordedAt
        ? progress.filter((entry) => entry.recorded_at === latestRecordedAt)
        : [];
    const latestTenBounce = latestRecordedAt
        ? tenBounceRecords.find(
              (entry) => entry.recorded_at === latestRecordedAt
          )
        : undefined;
    const recordedDifficulties = progress
        .filter(
            (entry) =>
                entry.routine_type === "optional" && entry.completed_count > 0
        )
        .map((entry) => entry.difficulty)
        .filter((difficulty): difficulty is number => difficulty != null);
    const difficultyRecord = recordedDifficulties.length
        ? Math.max(...recordedDifficulties)
        : null;

    return (
        <div className="mt-7 space-y-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                <LatestTrainingCard
                    recordedAt={latestRecordedAt}
                    progress={latestProgress}
                    tenBounce={latestTenBounce}
                />
                <DifficultyRecordCard difficulty={difficultyRecord} />
            </div>

            <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <PanelHeading title="Last week" subtitle="Compulsory and optional routines completed each day" />
                        <div className="flex gap-4 text-xs font-medium text-zinc-500">
                            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-300" />Compulsory</span>
                            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-700" />Optional</span>
                        </div>
                    </div>

                    <div className="mt-8 flex h-64 items-end gap-3 border-b border-zinc-100 sm:gap-5">
                        {activity.map((day) => (
                            <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" title={`${day.date}: ${day.compulsory} compulsory, ${day.optional} optional`}>
                                <div className="flex h-full w-full items-end justify-center gap-1 sm:gap-2">
                                    <Bar value={day.compulsory} peak={peak} color="bg-red-300" />
                                    <Bar value={day.optional} peak={peak} color="bg-red-700" />
                                </div>
                                <span className="mt-3 pb-3 text-sm font-medium text-zinc-500">{day.label}</span>
                            </div>
                        ))}
                    </div>
            </section>

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

function LatestTrainingCard({
    recordedAt,
    progress,
    tenBounce,
}: {
    recordedAt?: string;
    progress: RoutineProgress[];
    tenBounce?: TenBounceRecord;
}) {
    const completed = progress.filter((entry) => entry.completed_count > 0);

    return (
        <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start justify-between gap-4">
                <PanelHeading
                    title="Last submitted training"
                    subtitle={recordedAt ? formatDate(recordedAt) : "No training submitted yet"}
                />
                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-700 text-lg text-white">↗</span>
            </div>
            {recordedAt ? (
                <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                        {completed.map((entry) => (
                            <span key={entry.id} className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold capitalize text-red-800">
                                {entry.completed_count} × {entry.routine_type}
                                {entry.routine_type === "optional" && entry.difficulty != null
                                    ? ` (${entry.difficulty.toFixed(2)} DD)`
                                    : ""}
                            </span>
                        ))}
                        {tenBounce && (
                            <span className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-800">
                                {tenBounce.difficulty.toFixed(3)} second 10-bounce
                            </span>
                        )}
                        {completed.length === 0 && !tenBounce && (
                            <span className="text-sm text-zinc-500">No completed routines or 10-bounce time.</span>
                        )}
                    </div>
                    <div className="mt-6 border-t border-zinc-100 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Notes</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {tenBounce?.notes || "No notes added."}
                        </p>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function DifficultyRecordCard({ difficulty }: { difficulty: number | null }) {
    return (
        <section className="flex min-h-64 flex-col justify-between rounded-[28px] border border-red-700 bg-red-700 p-6 text-white shadow-sm sm:p-7">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-red-100">Personal record</p>
                    <h3 className="mt-1 text-xl font-bold">DD record</h3>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg">↗</span>
            </div>
            <div className="mt-8">
                <strong className="text-6xl tracking-tight">
                    {difficulty?.toFixed(2) ?? "—"}
                </strong>
                <p className="mt-3 text-sm text-red-100">
                    {difficulty == null
                        ? "No optional difficulty recorded yet."
                        : "Highest optional DD ever submitted."}
                </p>
            </div>
        </section>
    );
}

function Bar({ value, peak, color }: { value: number; peak: number; color: string }) {
    return (
        <div
            className={`relative w-full max-w-10 rounded-t-xl ${color}`}
            style={{ height: `${Math.max(value ? (value / peak) * 78 : 3, 3)}%` }}
        >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-zinc-600">
                {value}
            </span>
        </div>
    );
}

function PanelHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return <div><h3 className="text-xl font-bold text-zinc-950">{title}</h3><p className="mt-1 text-sm text-zinc-500">{subtitle}</p></div>;
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

function getWeeklyActivity(progress: RoutineProgress[]) {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        const entries = progress.filter((entry) =>
            sameDay(new Date(entry.recorded_at), date)
        );
        const compulsory = entries
            .filter((entry) => entry.routine_type === "compulsory")
            .reduce((sum, entry) => sum + entry.completed_count, 0);
        const optional = entries
            .filter((entry) => entry.routine_type === "optional")
            .reduce((sum, entry) => sum + entry.completed_count, 0);
        return { label: new Intl.DateTimeFormat("en-CA", { weekday: "narrow" }).format(date), date: new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(date), compulsory, optional };
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
