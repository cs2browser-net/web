import PageLayout from "@/components/layouts/PageLayout";
import HomePage from "@/components/pages/HomePage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "CS2Browser.net - Find Counter-Strike 2 servers",
}

export const viewport: Viewport = defaultViewport

export default function Home() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <HomePage />
            </div>
        </PageLayout>
    )
}