import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoachSelectionPage() {
    const supabase = await createClient();

    const { data: coaches, error } = await supabase
        .from("coaches")
        .select("id, name")
        .order("name");

    if (error) {
        console.error(error);
    }

    return (
        <main
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mountainbackground.jpg')" }}
        >
            <div className="absolute inset-0 bg-white/80" />

            <div className="relative z-10 w-full max-w-sm text-center">

                <h1 className="mb-6 text-2xl font-semibold text-black">
                    Select Coach
                </h1>

                <div className="grid grid-cols-2 gap-3">
                    {coaches?.map((coach) => (
                        <Link
                            key={coach.id}
                            href={`/athletes/${coach.id}`}
                            className="rounded-xl bg-black px-4 py-4 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
                        >
                            {coach.name}
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}