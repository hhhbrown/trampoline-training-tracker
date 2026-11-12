import { createClient } from "@/lib/supabase/server";
import { compulsorySkills } from "@/lib/compulsories";
import BackLink from "@/components/BackLink";

type PageProps = {
    params: Promise<{
        coachId: string;
        athleteId: string;
    }>;
};

export default async function AthleteRoutinesPage({ params }: PageProps) {
    const { coachId, athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error: athleteError } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("id", Number(athleteId))
        .single();

    if (athleteError) {
        return <p className="p-8 text-red-600">Error: {athleteError.message}</p>;
    }

    const { data: routines, error: routinesError } = await supabase
        .from("routines")
        .select("id, athlete_id, compulsory, custom_compulsory, optional_a, optional_a_difficulty, optional_b, optional_b_difficulty, double_mini_set_a, double_mini_set_a_difficulty, double_mini_set_b, double_mini_set_b_difficulty, skills, notes")
        .eq("athlete_id", Number(athleteId))
        .maybeSingle();

    if (routinesError) {
        return <p className="p-8 text-red-600">Error: {routinesError.message}</p>;
    }

    const skills: string[] =
        routines?.compulsory === "Level 5+"
            ? (routines.custom_compulsory ?? "")
                .split("\n")
                .map((skill: string) => skill.trim())
                .filter(Boolean)
            : compulsorySkills[routines?.compulsory ?? ""] ?? [];

    return (
        <main className="min-h-screen bg-zinc-50 px-4 pb-6 pt-24 text-zinc-950 sm:px-6 sm:pb-10">
            <div className="mx-auto max-w-5xl">
                <BackLink
                    href={`/athletes/${coachId}/${athleteId}`}
                >
                    Back to Dashboard
                </BackLink>

                <header className="mb-8 mt-6 border-b border-zinc-200 pb-8">
                    <p className="break-words text-3xl font-bold tracking-tight text-red-700 sm:text-4xl">{athlete.name}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                        <h1 className="text-sm font-semibold">Current Routines</h1>
                        {athlete.level && (
                            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-700">
                                {athlete.level}
                            </span>
                        )}
                    </div>
                </header>

                <div className="space-y-10">
                    <section aria-labelledby="trampoline-heading">
                        <h2 id="trampoline-heading" className="mb-4 text-xl font-bold text-red-900">Trampoline</h2>
                        <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                            <RoutineCard
                                title={routines?.compulsory === "Level 5+" ? "Compulsory" : routines?.compulsory || "Compulsory"}
                                value={skills.join("\n")}
                                emptyMessage="No compulsory routine selected yet."
                            />
                            <RoutineCard title="Optional A" value={routines?.optional_a} difficulty={routines?.optional_a_difficulty} />
                            <RoutineCard title="Optional B" value={routines?.optional_b} difficulty={routines?.optional_b_difficulty} />
                        </div>
                    </section>

                    <section aria-labelledby="double-mini-heading">
                        <h2 id="double-mini-heading" className="mb-4 text-xl font-bold text-red-900">Double Mini</h2>
                        <div className="grid items-start gap-5 md:grid-cols-2">
                            <RoutineCard title="Set A" value={routines?.double_mini_set_a} difficulty={routines?.double_mini_set_a_difficulty} />
                            <RoutineCard title="Set B" value={routines?.double_mini_set_b} difficulty={routines?.double_mini_set_b_difficulty} />
                        </div>
                    </section>

                    <section aria-labelledby="practice-heading">
                        <h2 id="practice-heading" className="mb-4 text-xl font-bold text-red-900">Skills & Notes</h2>
                        <div className="grid items-start gap-5 md:grid-cols-2">
                            <RoutineCard title="Skills" value={routines?.skills} numbered={false} />
                            <RoutineCard title="Notes" value={routines?.notes} numbered={false} />
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function RoutineCard({
    title,
    value,
    difficulty,
    numbered = true,
    emptyMessage = "Not added yet.",
}: {
    title: string;
    value: string | null | undefined;
    difficulty?: number | null;
    numbered?: boolean;
    emptyMessage?: string;
}) {
    const lines = (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);

    return (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-4">
                <h3 className="text-lg font-bold text-red-900">{title}</h3>
                {difficulty != null && (
                    <span className="rounded-lg bg-red-700 px-3 py-1.5 text-base font-bold tabular-nums text-white shadow-sm">
                        DD {difficulty.toFixed(2)}
                    </span>
                )}
            </div>

            {lines.length ? (
                numbered ? (
                    <ol className="divide-y divide-zinc-100">
                        {lines.map((line, index) => (
                            <li key={index} className="flex items-baseline gap-4 px-5 py-3.5">
                                <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-semibold tabular-nums text-red-700">
                                    {index + 1}
                                </span>
                                <span className="min-w-0 break-words text-base font-medium leading-7 text-zinc-900">{line}</span>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="whitespace-pre-line break-words px-5 py-5 text-base leading-7 text-zinc-800">{value}</p>
                )
            ) : (
                <p className="px-5 py-5 text-base leading-7 text-zinc-600">{emptyMessage}</p>
            )}
        </section>
    );
}
