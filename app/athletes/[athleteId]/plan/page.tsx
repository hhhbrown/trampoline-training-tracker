import { createClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{ athleteId: string }>;
};


export default async function AthletePlanPage({ params }: PageProps) {
    const { athleteId } = await params;
    const supabase = await createClient();

    const { data: athlete, error } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("id", Number(athleteId))
        .single();

    if (error) {
        return <p className="p-8 text-red-600">Error: {error.message}</p>;
    }

    const { data: plan } = await supabase
        .from("plans")
        .select("id, week")
        .eq("athlete_id", Number(athleteId))
        .single();

    const { data: planItems } = await supabase
        .from("plan_items")
        .select("id, name, target")
        .eq("plan_id", plan?.id)
        .order("id");

    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Athlete Profile
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-black">{athlete.name}</h1>
                    <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                        {athlete.level}
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-semibold text-black">Daily Plan</h2>
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="space-y-3">
                            {planItems?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between border-b border-zinc-100 pb-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" className="h-4 w-4 accent-red-600" />
                                        <span className="text-sm text-zinc-700">{item.name}</span>
                                    </div>

                                    <span className="text-lg font-semibold text-black">
                                        {item.target ?? "—"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <input
                            type="Comments"
                            placeholder="Enter comments"
                            className="w-full h-12 mt-4 px-4 py-2 rounded-lg border border-zinc-300 bg-white text-sm outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <button className="mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm transition">
                            Submit
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}