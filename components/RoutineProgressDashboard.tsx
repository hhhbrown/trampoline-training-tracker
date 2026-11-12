import ActivityCalendar from "./ActivityCalendar";

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
    const monthly = getMonthlyActivity(progress);
    const peak = Math.max(
        ...activity.flatMap((day) => [day.compulsory, day.optional]),
        1
    );
    const personalBest = tenBounceRecords.length
        ? Math.max(...tenBounceRecords.map((entry) => entry.difficulty))
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
            <link
                rel="stylesheet"
                href="https://cdn-uicons.flaticon.com/4.0.0/uicons-regular-straight/css/uicons-regular-straight.css"
                precedence="default"
            />
            <link
                rel="stylesheet"
                href="https://cdn-uicons.flaticon.com/4.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css"
                precedence="default"
            />
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
                <MonthlyRoutinesCard monthly={monthly} />
                <section className="flex min-h-80 flex-col justify-between rounded-[28px] border border-zinc-900 bg-zinc-950 p-7 text-white shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">10-bounce PB</h3>
                        </div>
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-red-600 text-xl">
                            <i aria-hidden="true" className="fi fi-sr-arrow-trend-up inline-flex text-xl" />
                        </span>
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

            <ActivityCalendar
                progress={progress}
                tenBounceRecords={tenBounceRecords}
                today={new Intl.DateTimeFormat("en-CA", { timeZone: "America/Vancouver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())}
            />
        </div>
    );
}

function MonthlyRoutinesCard({ monthly }: { monthly: ReturnType<typeof getMonthlyActivity> }) {
    return (
        <section aria-labelledby="monthly-routines-heading" className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 id="monthly-routines-heading" className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">Routines this month</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {([
                    ["compulsory", "Compulsories"],
                    ["optional", "Optionals"],
                ] as const).map(([type, title]) => {
                    const current = monthly.current[type];
                    const previous = monthly.previous[type];
                    const remaining = Math.max(previous - current, 0);
                    return (
                        <div key={type} className="rounded-2xl border border-red-100 p-5">
                            <h3 className="text-lg font-bold text-zinc-950">{title}</h3>
                            <p className="mt-4 text-5xl font-bold tabular-nums tracking-tight text-red-700">{current}</p>
                            <p className="mt-2 text-sm font-medium text-zinc-600">{monthly.currentLabel} so far</p>
                            <p className="mt-4 text-sm text-zinc-700">
                                {monthly.previousLabel}: <span className="font-bold tabular-nums">{previous}</span>
                            </p>
                            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold leading-6 text-red-900">
                                {remaining > 0
                                    ? `${remaining} more to match last month`
                                    : current > previous
                                      ? `${current - previous} more than last month!`
                                      : current > 0
                                        ? "You’ve matched last month!"
                                        : "No routines completed this month or last month yet."}
                            </p>
                        </div>
                    );
                })}
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
                <span className="grid h-10 w-10 place-items-center rounded-full bg-red-700 text-lg text-white">
                    <i aria-hidden="true" className="fi fi-sr-yoga-moon inline-flex text-xl" />
                </span>
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
                    <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">DD record</h3>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-lg">
                    <i aria-hidden="true" className="fi fi-rs-award inline-flex text-xl" />
                </span>
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
    return <div><h3 className="text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">{title}</h3><p className="mt-2 text-sm text-zinc-500">{subtitle}</p></div>;
}

function getMonthlyActivity(progress: RoutineProgress[], now = new Date()) {
    const monthFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver",
        year: "numeric",
        month: "numeric",
    });
    const monthIndex = (date: Date) => {
        const parts = monthFormatter.formatToParts(date);
        const year = Number(parts.find((part) => part.type === "year")?.value);
        const month = Number(parts.find((part) => part.type === "month")?.value);
        return year * 12 + month - 1;
    };
    const currentMonth = monthIndex(now);
    const current = { compulsory: 0, optional: 0 };
    const previous = { compulsory: 0, optional: 0 };

    for (const entry of progress) {
        if (entry.routine_type !== "compulsory" && entry.routine_type !== "optional") continue;
        const recordedAt = new Date(entry.recorded_at);
        if (!Number.isFinite(recordedAt.getTime()) || recordedAt > now) continue;
        const month = monthIndex(recordedAt);
        if (month === currentMonth) current[entry.routine_type] += entry.completed_count;
        if (month === currentMonth - 1) previous[entry.routine_type] += entry.completed_count;
    }

    const label = (index: number) => new Intl.DateTimeFormat("en-CA", {
        timeZone: "UTC",
        month: "long",
        year: "numeric",
    }).format(new Date(Date.UTC(Math.floor(index / 12), index % 12, 1)));

    return { current, previous, currentLabel: label(currentMonth), previousLabel: label(currentMonth - 1) };
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
