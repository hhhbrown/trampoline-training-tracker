'use client';

export default function EditDailyPlanPage() {
    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                        Coach View
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-black">Edit Daily Plan</h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Update this athlete’s plan for the week.
                    </p>
                </div>

                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-black">Daily Plan</h2>
                        <button
                            type="button"
                            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition"
                        >
                            Save
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-[1fr_100px] gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Task
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Bounces"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Turns
                                </label>
                                <input
                                    type="text"
                                    defaultValue=""
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_100px] gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Task
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Front 3/4 Warm Up"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Turns
                                </label>
                                <input
                                    type="text"
                                    defaultValue=""
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_100px] gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Task
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Compulsory"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Turns
                                </label>
                                <input
                                    type="text"
                                    defaultValue="2"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_100px] gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Task
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Last 4"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Turns
                                </label>
                                <input
                                    type="text"
                                    defaultValue="1"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-[1fr_100px] gap-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Task
                                </label>
                                <input
                                    type="text"
                                    defaultValue="Optional"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-zinc-700">
                                    Turns
                                </label>
                                <input
                                    type="text"
                                    defaultValue="3"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}