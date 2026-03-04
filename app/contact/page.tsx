import PageLayout from "@/components/layouts/PageLayout";
import Contact from "@/components/pages/ContactPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Contact Us - " + SiteSettings[SITE_VARIANT].name,
    description: "Get in touch with the " + SiteSettings[SITE_VARIANT].name + " team. Send us your feedback, questions, or suggestions about our " + SiteSettings[SITE_VARIANT].gamename + " server browser.",
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