import Link from "next/link";

export default function HomePage() {
    return (
        <main
            className="relative min-h-screen flex items-center justify-center px-6 bg-center bg-cover"
            style={{
                backgroundImage: "url('/images/mountainbackground.jpg')",
            }}
        >
            <div className="absolute inset-0 bg-white/80" />

            <div className="relative text-center max-w-xl">
                <div>
                    <h1 className="text-3xl font-bold text-black pb-4">
                        Shasta Training Logs
                    </h1>
                </div>

                <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">

                    <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-black">Coaches</h2>
                        <p className="text-sm text-zinc-600 mt-2">
                            View and manage your athletes.
                        </p>

                        <Link
                            href="/coach-login"
                            className="inline-block mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800"
                        >
                            Enter
                        </Link>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-200 hover:shadow-md transition">
                        <h2 className="text-lg font-semibold text-black">Athletes</h2>
                        <p className="text-sm text-zinc-600 mt-2">
                            Track training sessions.
                        </p>

                        <Link
                            href="/athlete-login"
                            className="inline-block mt-4 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-700"
                        >
                            Enter
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}