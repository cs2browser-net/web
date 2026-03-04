"use client";

import { EndpointCard } from "@/components/docs/api/EndpointCard";
import PageLayout from "@/components/layouts/PageLayout";
import { apiEndpoints } from "@/lib/api/data";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { Code } from "lucide-react";

export default function ApiDocsPage() {

    return (
        <PageLayout>
            <div className="flex flex-col justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <div className="text-center mb-8 md:mb-12 mt-4">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4">
                        API Documentation
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-4">
                        Access {SITE_VARIANT.toUpperCase()} server data programmatically with our comprehensive REST API.
                        Get server lists, detailed information, filters, and location data.
                    </p>
                </div>

                <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 md:p-6 mb-6 md:mb-8 w-full">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center">
                        <Code className="w-5 h-5 md:w-6 md:h-6 mr-2 text-[#00feed]" />
                        Getting Started
                    </h2>
                    <div className="space-y-4 text-gray-300 text-sm md:text-base">
                        <p>
                            The {SiteSettings[SITE_VARIANT].name} API provides access to comprehensive {SITE_VARIANT.toUpperCase()} server data including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2 md:ml-4">
                            <li>Real-time server information and player counts</li>
                            <li>Advanced filtering by location, gamemode, ping, and more</li>
                            <li>Historical player count data and statistics</li>
                            <li>Geographical location data for ping calculations</li>
                        </ul>
                        <div className="bg-gray-800/40 rounded-lg p-3 md:p-4 mt-4">
                            <h3 className="text-white font-medium mb-2 text-sm md:text-base">Base URL</h3>
                            <code className="text-[#00feed] font-mono text-sm md:text-base break-all">{SiteSettings[SITE_VARIANT].url}</code>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 md:p-6 mb-6 md:mb-8 w-full">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Advanced Search Features</h2>
                    <div className="grid sm:grid-cols-2 gap-4 md:gap-6 text-gray-300 text-sm md:text-base">
                        <div className="bg-gray-800/20 rounded-lg p-3 md:p-4">
                            <h3 className="text-white font-medium mb-2">Multi-tag Search</h3>
                            <p className="mb-2 text-xs md:text-sm">Use commas to require ALL terms:</p>
                            <code className="text-[#00feed] text-xs md:text-sm bg-gray-800 px-2 py-1 rounded break-all">surf,beginner</code>
                        </div>
                        <div className="bg-gray-800/20 rounded-lg p-3 md:p-4">
                            <h3 className="text-white font-medium mb-2">NOT Operator</h3>
                            <p className="mb-2 text-xs md:text-sm">Use ! to exclude servers:</p>
                            <code className="text-[#00feed] text-xs md:text-sm bg-gray-800 px-2 py-1 rounded break-all">surf,!combat</code>
                        </div>
                        <div className="bg-gray-800/20 rounded-lg p-3 md:p-4">
                            <h3 className="text-white font-medium mb-2">Regex Support</h3>
                            <p className="mb-2 text-xs md:text-sm">Full regex patterns supported:</p>
                            <code className="text-[#00feed] text-xs md:text-sm bg-gray-800 px-2 py-1 rounded break-all">^Community.*Server$</code>
                        </div>
                        <div className="bg-gray-800/20 rounded-lg p-3 md:p-4">
                            <h3 className="text-white font-medium mb-2">IP Filtering</h3>
                            <p className="mb-2 text-xs md:text-sm">Search by IP ranges:</p>
                            <code className="text-[#00feed] text-xs md:text-sm bg-gray-800 px-2 py-1 rounded break-all">192.168.0.1</code>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">API Endpoints</h2>
                    {apiEndpoints.map((endpoint, index) => (
                        <EndpointCard key={index} endpoint={endpoint} />
                    ))}
                </div>

                <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 mt-12 text-center w-full">
                    <h3 className="text-white font-medium mb-2">Need Help?</h3>
                    <p className="text-gray-300">
                        Have questions about the API? Contact us for support.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
}