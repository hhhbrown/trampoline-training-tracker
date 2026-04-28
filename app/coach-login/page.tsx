'use client';
import { useRouter } from "next/navigation";

export default function CoachLoginPage() {

    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.push("/coach");
    }

    return (
        <main
            className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mountainbackground.jpg')" }}
        >
            <div className="absolute inset-0 bg-white/80" >
                <div className="mx-auto max-w-xs">
                    <div className="flex flex-col h-screen items-center justify-center relative z-10 w-full max-w-sm text-center">

                        <h1 className="text-3xl font-bold text-black">
                            Coach Portal
                        </h1>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="w-full h-12 px-4 rounded-lg border border-zinc-300 bg-white text-black outline-none focus:ring-2 focus:ring-red-500"
                            />

                            <button
                                type="submit"
                                className="w-full h-12 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition"
                            >
                                Enter
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}