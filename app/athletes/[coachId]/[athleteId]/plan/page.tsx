import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    coachId: string;
    athleteId: string;
  }>;
};

export default async function AthletePlanPage({ params }: PageProps) {
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

    const { data: plan } = await supabase
        .from("plans")
        .select("id, week")
        .eq("athlete_id", Number(athleteId))
        .single();

    const { data: planItems } = plan
        ? await supabase
            .from("plan_items")
            .select("id, name, target")
            .eq("plan_id", plan.id)
            .order("id")
        : { data: [] };

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <Link
                    href={`/athletes/${coachId}/${athleteId}`}
                    className="mb-6 inline-block text-sm font-medium text-red-600 underline"
                >
                    ← Back to Dashboard
                </Link>

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
                    <h2 className="text-xl font-semibold text-black">Daily Plan</h2>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                        {planItems && planItems.length > 0 ? (
                            <div className="divide-y divide-zinc-100">
                                {planItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 accent-red-600"
                                            />

                                            <span className="text-sm text-zinc-700">
                                                {item.name}
                                            </span>
                                        </div>

                                        <span className="text-lg font-semibold text-black">
                                            {item.target ?? "—"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500">No plan available.</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Enter comments"
                            className="mt-4 h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <button className="mt-4 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800">
                            Submit
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}