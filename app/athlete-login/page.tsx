'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AthleteLoginPage() {
    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.push("/athletes");
    }

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
                    <h1 className="text-3xl font-bold text-black">
                        Athlete Portal
                    </h1>

                    <form onSubmit={handleSubmit} className="mt-8">
                        <button
                            type="submit"
                            className="mx-auto block h-12 w-40 rounded-lg bg-black text-sm font-medium text-white transition hover:bg-zinc-800"
                        >
                            Enter
                        </button>
                    </form>
                </div>

            </div>
        </main>
    );
}