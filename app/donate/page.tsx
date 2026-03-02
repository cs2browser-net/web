import PageLayout from "@/components/layouts/PageLayout";
import DonationPage from "@/components/pages/DonationPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Donate - CS2Browser.net",
    description: "Support CS2Browser.net development and help us maintain the best Counter-Strike 2 server browser. Your donations keep the service running.",
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