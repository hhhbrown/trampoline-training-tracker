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
                    Select your name
                </h1>

                <div className="grid grid-cols-2 gap-3">
                    <Link 
                        href="/test-athlete"
                        className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                        >
                        Tyler
                    </Link>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                        Paul
                    </button>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                        Eileif
                    </button>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                        Francisco
                    </button>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hhover:bg-red-700 transition">
                        Micah
                    </button>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                        Reave
                    </button>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                        Michael
                    </button>

                    <button className="py-3 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                        Willson
                    </button>
                </div>
                <div className= "mt-6">
                    <button className="px-8 py-3 rounded-lg bg-black text-white text-sm hover:bg-zinc-800 transition">
                        Manage Athletes
                    </button>
                    </div>
            </div>
        </main>
    );
}