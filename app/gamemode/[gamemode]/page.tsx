"use client";

import PageLayout from "@/components/layouts/PageLayout";
import HomePage from "@/components/pages/HomePage";
import { use } from "react";

// export const metadata: Metadata = {
//     ...defaultMetadata,
//     title: "CS2Browser.net - Find Counter-Strike 2 servers",
// }

// export const viewport: Viewport = defaultViewport

export default function Home({ params }: { params: Promise<{ gamemode?: string }> }) {
    const { gamemode } = use(params);

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <HomePage gamemode={gamemode} />
            </div>
        </PageLayout>
    )
}