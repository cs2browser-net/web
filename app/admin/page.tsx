import PageLayout from "@/components/layouts/PageLayout";
import AdminPage from "@/components/pages/AdminPage";
import { defaultMetadata, defaultViewport } from "@/components/seo/metadata";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    ...defaultMetadata,
    title: "Admin - " + SiteSettings[SITE_VARIANT].name,
    description: "Admin dashboard for managing " + SiteSettings[SITE_VARIANT].gamename + " servers.",
}

export const viewport: Viewport = defaultViewport

export default function Admin() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <AdminPage />
            </div>
        </PageLayout>
    )
}
