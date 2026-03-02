"use client";

import PageLayout from "@/components/layouts/PageLayout";
import ServerPage from "@/components/pages/ServerPage";
import { use } from "react";

export default function ServerViewPage({ params }: { params: Promise<{ serverid: string }> }) {
    const { serverid } = use(params);

    return (
        <PageLayout>
            <div className="flex flex-row justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <ServerPage serverid={serverid} />
            </div>
        </PageLayout>
    )
}