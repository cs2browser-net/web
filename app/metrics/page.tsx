import PageLayout from "@/components/layouts/PageLayout";
import { default as MetricsPageComponent } from "@/components/pages/MetricsPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Metrics & Statistics - CS2Browser.net",
    description: "View detailed statistics and metrics for Counter-Strike 2 servers. Track player counts, server trends, and CS2 community analytics.",
}

export const viewport: Viewport = defaultViewport

export default function MetricsPage() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <MetricsPageComponent />
            </div>
        </PageLayout>
    )
}