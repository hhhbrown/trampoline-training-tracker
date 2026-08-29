import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BackLink from "@/components/BackLink";

type PageProps = {
    params: Promise<{
        coachId: string;
        athleteId: string;
    }>;
};

export default async function AthleteDashboardPage({ params }: PageProps) {
    const { coachId, athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("id", Number(athleteId))
        .single();

    if (error) {
        return <p className="p-8 text-red-600">Error: {error.message}</p>;
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 pb-10 pt-24">
            <div className="mx-auto max-w-2xl">
                <BackLink href={`/athletes/${coachId}`}>
                    Back to Athletes
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

                <section className="grid gap-4">
                    <Link
                        href={`/athletes/${coachId}/${athleteId}/plan`}
                        className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50"
                    >
                        <h2 className="text-lg font-semibold text-black">Daily Plan</h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            View turns, assignments, and comments.
                        </p>
                    </Link>

                    <Link
                        href={`/athletes/${coachId}/${athleteId}/routines`}
                        className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50"
                    >
                        <h2 className="text-lg font-semibold text-black">Routines</h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            View compulsory and optional routines.
                        </p>
                    </Link>

                    <Link
                        href={`/athletes/${coachId}/conditioning`}
                        className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:bg-zinc-50"
                    >
                        <h2 className="text-lg font-semibold text-black">
                            Weekly Conditioning
                        </h2>
                        <p className="mt-1 text-sm text-zinc-600">
                            View your coach&apos;s Monday–Sunday conditioning.
                        </p>
                    </Link>
                </section>
            </div>
        </main>
    );
}
