import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
    params: Promise<{
        coachId: string;
    }>;
};

export default async function CoachAthletesPage({ params }: PageProps) {
    const { coachId } = await params;
    const supabase = await createClient();

    const { data: athletes, error } = await supabase
        .from("athletes")
        .select("id, name, level")
        .eq("coach_id", Number(coachId))
        .order("name");

    if (error) {
        return <p className="p-8 text-red-600">Error: {error.message}</p>;
    }

    return (
        <main
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mountainbackground.jpg')" }}
        >
            <div className="absolute inset-0 bg-white/80" />

            <div className="relative z-10 w-full max-w-sm">

                <Link
                    href="/athletes"
                    className="absolute left-0 top-0 text-sm font-medium text-red-600 underline"
                >
                    ← Back to Coaches
                </Link>

                <div className="pt-10 text-center">
                    <h1 className="mb-6 text-2xl font-semibold text-black">
                        Select Athlete
                    </h1>

                    <div className="grid grid-cols-2 gap-3">
                        {athletes?.map((athlete) => (
                            <Link
                                key={athlete.id}
                                href={`/athletes/${coachId}/${athlete.id}`}
                                className="rounded-xl bg-black px-4 py-4 text-center text-sm font-medium text-white hover:bg-zinc-800 transition"
                            >
                                {athlete.name}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}