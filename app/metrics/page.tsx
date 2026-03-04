import PageLayout from "@/components/layouts/PageLayout";
import { default as MetricsPageComponent } from "@/components/pages/MetricsPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Metrics & Statistics - " + SiteSettings[SITE_VARIANT].name,
    description: "View detailed statistics and metrics for " + SiteSettings[SITE_VARIANT].gamename + " servers. Track player counts, server trends, and " + SiteSettings[SITE_VARIANT].gamename + " community analytics.",
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