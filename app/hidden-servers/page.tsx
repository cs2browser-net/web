import PageLayout from "@/components/layouts/PageLayout";
import HiddenServersPage from "@/components/pages/HiddenServersPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Hidden Servers - CS2Browser.net",
    description: "Manage your hidden Counter-Strike 2 servers. View and unhide CS2 servers you've chosen to filter from your search results.",
}

export const viewport: Viewport = defaultViewport

export default function Home() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <HiddenServersPage />
            </div>
        </PageLayout>
    )
}