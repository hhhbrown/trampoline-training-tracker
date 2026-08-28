import Link from "next/link";
import type { ReactNode } from "react";

type BackLinkProps = {
    href: string;
    children: ReactNode;
};

export default function BackLink({
    href,
    children,
}: BackLinkProps) {
    return (
        <Link
            href={href}
            className="fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-50 inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-black/15 transition-colors hover:border-red-600 hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4 shrink-0"
            >
                <path
                    d="M15.5 10H4.5m0 0 4.25-4.25M4.5 10l4.25 4.25"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span>{children}</span>
        </Link>
    );
}
