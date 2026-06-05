import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
    const supabase = await createClient();

    const { data: coaches, error } = await supabase
        .from("coaches")
        .select("id, name")
        .order("id");


    return (
        <main
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mountainbackground.jpg')" }}
        >
            <div className="absolute inset-0 bg-white/80" />

            <div className="relative z-10 w-full max-w-sm">

                <Link
                    href="/"
                    className="absolute left-0 top-0 inline-flex items-center text-sm text-zinc-600 hover:text-black"
                >
                    ← Home
                </Link>

                <div className="pt-10 text-center">
                    <h1 className="mb-6 text-2xl font-semibold text-black">
                        Select Coach
                    </h1>

                    <div className="grid grid-cols-2 gap-3">
                        {coaches?.map((coach) => (
                            <Link
                                key={coach.id}
                                href={`/coach/${coach.id}/athletes`}
                                className="rounded-xl bg-black px-4 py-4 text-center text-sm font-medium text-white hover:bg-zinc-800 transition"
                            >
                                {coach.name}
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}