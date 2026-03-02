"use client";

import PageLayout from "@/components/layouts/PageLayout";
import Contact from "@/components/pages/ContactPage";

// export const metadata: Metadata = {
//     ...defaultMetadata,
//     title: "CS2Browser.net - Find Counter-Strike 2 servers",
// }

// export const viewport: Viewport = defaultViewport

export default function ContactPage() {

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <Contact />
            </div>
        </PageLayout>
    )
}