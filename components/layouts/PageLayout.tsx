"use client";

import { useLocationStore } from "@/lib/location/store";
import { trpc } from "@/lib/trpc";
import Header from "../navigation/Header";
import { useEffect } from "react";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const locationData = trpc.location.getInfo.useQuery()
    const location = useLocationStore()

    useEffect(() => {
        if (!locationData.isLoading && locationData.data && !locationData.isError && !location.location) {
            location.setLocation(locationData.data)
        }
    }, [locationData.data])

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <footer className="mt-8 border-t border-gray-700/50 bg-gray-900/30 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6 py-6">
                    <p className="text-center text-xs text-gray-400">
                        {SiteSettings[SITE_VARIANT].name} is a hobby project and is not affiliated with Valve or Steam. All times on the site are in UTC.<br />
                        Steam and the Steam logo are trademarks of Valve Corporation. All other trademarks are property of their respective owners.<br />
                        Copyright © 2025-2026 <span className="text-[#00feed]">Swiftly Solution SRL</span>. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}