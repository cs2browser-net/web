import PageLayout from "@/components/layouts/PageLayout";
import Contact from "@/components/pages/ContactPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Contact Us - CS2Browser.net",
    description: "Get in touch with the CS2Browser.net team. Send us your feedback, questions, or suggestions about our Counter-Strike 2 server browser.",
}

export const viewport: Viewport = defaultViewport

export default function ContactPage() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <Contact />
            </div>
        </PageLayout>
    )
}