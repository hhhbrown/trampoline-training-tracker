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
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 pb-10 pt-24">
            <div className="mx-auto max-w-2xl">
                <BackLink href={`/athletes/${coachId}/${athleteId}`}>
                    Back to Dashboard
                </BackLink>

                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Athlete Profile
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-black">
                        {athlete.name}
                    </h1>

                    <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                        {athlete.level}
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-semibold text-black">Routines</h2>

                    <div className="mt-4 space-y-4">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h3 className="text-base font-semibold text-black">
                                {routines?.compulsory === "Level 5+"
                                    ? "Compulsory"
                                    : routines?.compulsory ?? "Compulsory"}
                            </h3>

                            {skills.length > 0 ? (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                                    {skills.join("\n")}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-zinc-400">
                                    No compulsory routine selected yet.
                                </p>
                            )}
                        </div>

                        <RoutineCard
                            title="Optional A"
                            value={routines?.optional_a}
                            difficulty={routines?.optional_a_difficulty}
                        />
                        <RoutineCard
                            title="Optional B"
                            value={routines?.optional_b}
                            difficulty={routines?.optional_b_difficulty}
                        />
                        <RoutineCard
                            title="Double Mini Set A"
                            value={routines?.double_mini_set_a}
                            difficulty={routines?.double_mini_set_a_difficulty}
                        />
                        <RoutineCard
                            title="Double Mini Set B"
                            value={routines?.double_mini_set_b}
                            difficulty={routines?.double_mini_set_b_difficulty}
                        />
                        <RoutineCard title="Skills" value={routines?.skills} />
                        <RoutineCard title="Notes" value={routines?.notes} />
                    </div>
                </section>
            </div>
        </main>
    );
}

function RoutineCard({
    title,
    value,
    difficulty,
}: {
    title: string;
    value: string | null | undefined;
    difficulty?: number | null;
}) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-base font-semibold text-black">{title}</h3>

            {difficulty != null && (
                <p className="mt-1 text-sm font-medium text-red-600">
                    DD: {difficulty}
                </p>
            )}

            {value ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                    {value}
                </p>
            ) : (
                <p className="mt-2 text-sm text-zinc-400">Not added yet.</p>
            )}
        </div>
    );
}
