"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BackLink from "@/components/BackLink";

export default function CoachLoginPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email: "shastatrampolinehb@gmail.com",
            password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        router.push("/coach");
    }

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
                    <h1 className="text-3xl font-bold text-black">
                        Coach Portal
                    </h1>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 w-full rounded-lg border border-zinc-300 bg-white px-4 text-black outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <button
                            type="submit"
                            className="h-12 w-full rounded-lg bg-black text-sm font-medium text-white transition hover:bg-zinc-800"
                        >
                            Enter
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
