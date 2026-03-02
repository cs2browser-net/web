"use client";

import Link from "next/link";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

export default function Header() {
    return (
        <header className="top-0 p-7 z-40 w-full dark:border-b-zinc-700">
            <div className="flex justify-between mx-2 md:mx-auto md:max-w-[80%] items-center gap-4">
                <Link
                    rel="noreferrer noopener"
                    href="/"
                    className="text-xl flex shrink-0"
                >
                    CS2Browser.net
                </Link>

                <div className="flex items-center space-x-4 flex-1 justify-end">
                    <div className="hidden lg:flex items-center space-x-4">
                        <DesktopHeader />
                    </div>

                    <MobileHeader />
                </div>
            </div>
        </header>
    )
}