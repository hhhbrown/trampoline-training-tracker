import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{ coachId: string }>;
};

export default async function CoachAthletesPage({ params }: PageProps) {
    const { coachId } = await params;

    const supabase = await createClient();

    const { data: athletes, error } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("coach_id", Number(coachId))
        .order("name");

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                    Coach View
                </p>

                <h1 className="mt-2 text-3xl font-bold text-black">
                    Athlete Group
                </h1>

                {error && (
                    <p className="mt-4 text-red-600">
                        Error: {error.message}
                    </p>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {athletes?.map((athlete) => (
                        <Link
                            key={athlete.id}
                            href={`/athletes/${athlete.id}/plan`}
                            className="rounded-xl bg-black px-4 py-4 text-center text-sm font-medium text-white hover:bg-zinc-800 transition"
                        >
                            {athlete.name}
                            <span className="mt-1 block text-xs text-zinc-300">
                                {athlete.level}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}