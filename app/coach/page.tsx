import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BackLink from "@/components/BackLink";

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

                <BackLink href="/">
                    Home
                </BackLink>

                <div className="text-center">
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
                    <Link
                        href="/coach/resources"
                        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                    >
                        Resources
                    </Link>
                </div>

            </div>
        </main>
    );
}
