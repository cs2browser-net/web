import PageLayout from "@/components/layouts/PageLayout";
import DonationPage from "@/components/pages/DonationPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Donate - " + SiteSettings[SITE_VARIANT].name,
    description: "Support " + SiteSettings[SITE_VARIANT].name + " development and help us maintain the best " + SiteSettings[SITE_VARIANT].gamename + " server browser. Your donations keep the service running.",
}

export const viewport: Viewport = defaultViewport

export default function Donate() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <DonationPage />
            </div>
        </PageLayout>
    )
}