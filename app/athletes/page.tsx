'use client';

import Link from "next/link";

export default function CoachSelection() {
    return (
        <main
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mountainbackground.jpg')" }}
        >
            <div className="absolute inset-0 bg-white/80" />

            <div className="relative z-10 w-full max-w-sm text-center">

                <h1 className="text-2xl font-semibold text-black mb-6">
                    Select Coach
                </h1>

                <div className="grid grid-cols-2 gap-3">

                    <button className="py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition">
                        Curt
                    </button>

                    <button className="py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition">
                        Poppy
                    </button>

                    <button className="py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition">
                        Lisa
                    </button>
                    <Link
                        href="/athlete-selection"
                        className="py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition"
                        >
                        Hannah
                    </Link>

                    <button className="py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition">
                        Cole
                    </button>

                    <button className="py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition">
                        Gabby
                    </button>
                </div>
            </div>
        </main>
    );
}