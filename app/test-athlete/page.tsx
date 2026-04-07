export default function AthletePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-red-400 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Athlete Profile
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-black">Name</h1>
                    <div className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
                        Level 2
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-semibold text-black">Daily Plan</h2>
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Bounces</span>
                                </div>

                                <span className="text-lg font-semibold text-black"></span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Front 3/4s</span>
                                </div>

                                <span className="text-lg font-semibold text-black"></span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Compulsory</span>
                                </div>

                                <span className="text-lg font-semibold text-black">2</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Optional</span>
                                </div>

                                <span className="text-lg font-semibold text-black">3</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">8 skill Drill</span>
                                </div>

                                <span className="text-lg font-semibold text-black">2</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Extended Front 3/4</span>
                                </div>

                                <span className="text-lg font-semibold text-black">2</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Ball Out</span>
                                </div>

                                <span className="text-lg font-semibold text-black">2</span>
                            </div>

                            <div className="flex items-center justify-between border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 accent-red-600"
                                    />
                                    <span className="text-sm text-zinc-700">Cody Timers</span>
                                </div>

                                <span className="text-lg font-semibold text-black">2</span>
                            </div>
                        </div>
                    </div>
                    <div>
                    <input
                        type="Comments"
                        placeholder="Enter comments"
                        className="w-full h-12 mt-4 px-4 py-2 rounded-lg border border-zinc-300 bg-white text-sm outline-none focus:ring-2 focus:ring-red-500"
                    />
                    </div>
                    <div>
                        <button className="mt-4 px-4 py-2 rounded-lg bg-black text-white text-sm transition">
                            Submit
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}