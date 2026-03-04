"use client";

import { APIEndpoint } from "@/lib/api/data";
import { SITE_VARIANT, SiteSettings } from "@/lib/consts/settings";
import { ChevronRight, Copy, Play } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";

export const EndpointCard: FC<{ endpoint: APIEndpoint }> = ({ endpoint }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getMethodColor = (method: string) => {
        switch (method.toUpperCase()) {
            case 'GET': return 'bg-green-600';
            case 'POST': return 'bg-blue-600';
            case 'PUT': return 'bg-orange-600';
            case 'DELETE': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!', {
            icon: <Copy className="h-4 w-4" />,
            duration: 2000,
        });
    };

    const tryItOut = () => {
        const baseUrl = SiteSettings[SITE_VARIANT].url;
        const fullUrl = `${baseUrl}${endpoint.path}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-medium w-fit ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                        </span>
                        <code className="text-[#00feed] font-mono text-sm sm:text-lg break-all">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                tryItOut();
                            }}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-[#00feed] text-black rounded-lg hover:bg-[#00d4c7] transition-colors text-sm"
                        >
                            <Play className="w-4 h-4" />
                            <span>Try it</span>
                        </button>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                </div>
                <p className="text-gray-300 mt-2">{endpoint.summary}</p>
            </div>

            <div className={`border-t border-gray-700/50 transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}>
                <div className={`p-4 space-y-6 transition-all duration-300 ease-in-out ${isExpanded ? 'translate-y-0' : '-translate-y-4'
                    }`}>
                    <div>
                        <h4 className="text-white font-medium mb-2">Description</h4>
                        <p className="text-gray-300">{endpoint.description}</p>
                    </div>

                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                            <h4 className="text-white font-medium mb-3">Parameters</h4>

                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left text-gray-300 py-2 text-sm w-32">Name</th>
                                            <th className="text-left text-gray-300 py-2 text-sm w-16">In</th>
                                            <th className="text-left text-gray-300 py-2 text-sm w-20">Type</th>
                                            <th className="text-left text-gray-300 py-2 text-sm w-20">Required</th>
                                            <th className="text-left text-gray-300 py-2 text-sm">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {endpoint.parameters.map((param, index) => (
                                            <tr key={index} className="border-b border-gray-800 align-top">
                                                <td className="py-3 pr-4">
                                                    <code className="text-[#00feed] bg-gray-800 px-2 py-1 rounded text-sm whitespace-nowrap">
                                                        {param.name}
                                                    </code>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-300 text-sm">{param.in}</td>
                                                <td className="py-3 pr-4">
                                                    <span className="text-blue-400 font-mono text-sm">{param.type}</span>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span className={`text-sm ${param.required ? 'text-red-400' : 'text-gray-500'}`}>
                                                        {param.required ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-300 text-sm leading-relaxed">
                                                    <div className="break-words">
                                                        {param.description}
                                                        {param.example !== undefined && (
                                                            <div className="mt-2 p-2 bg-gray-800/50 rounded">
                                                                <span className="text-gray-500 text-sm">Example: </span>
                                                                <code className="text-yellow-400 text-sm break-all">
                                                                    {typeof param.example === 'string' ? param.example : JSON.stringify(param.example)}
                                                                </code>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="hidden md:block lg:hidden space-y-3">
                                {endpoint.parameters.map((param, index) => (
                                    <div key={index} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                                        <div className="flex items-start justify-between mb-2">
                                            <code className="text-[#00feed] bg-gray-800 px-2 py-1 rounded text-sm font-medium">
                                                {param.name}
                                            </code>
                                            <div className="flex flex-col items-end text-xs space-y-1">
                                                <span className="text-gray-400">{param.in}</span>
                                                <span className="text-blue-400 font-mono">{param.type}</span>
                                                <span className={param.required ? 'text-red-400 font-medium' : 'text-gray-500'}>
                                                    {param.required ? 'Required' : 'Optional'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-2">{param.description}</p>
                                        {param.example !== undefined && (
                                            <div className="bg-gray-900/50 rounded p-2">
                                                <span className="text-gray-500 text-xs">Example: </span>
                                                <code className="text-yellow-400 text-xs break-all">
                                                    {typeof param.example === 'string' ? param.example : JSON.stringify(param.example)}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="md:hidden space-y-3">
                                {endpoint.parameters.map((param, index) => (
                                    <div key={index} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                                        <div className="flex items-start justify-between mb-2">
                                            <code className="text-[#00feed] bg-gray-800 px-2 py-1 rounded text-sm font-medium">
                                                {param.name}
                                            </code>
                                            <div className="flex flex-col items-end text-xs space-y-1">
                                                <span className="text-gray-400">{param.in}</span>
                                                <span className="text-blue-400 font-mono">{param.type}</span>
                                                <span className={param.required ? 'text-red-400 font-medium' : 'text-gray-500'}>
                                                    {param.required ? 'Required' : 'Optional'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-2">{param.description}</p>
                                        {param.example !== undefined && (
                                            <div className="bg-gray-900/50 rounded p-2">
                                                <span className="text-gray-500 text-xs">Example: </span>
                                                <code className="text-yellow-400 text-xs break-all">
                                                    {typeof param.example === 'string' ? param.example : JSON.stringify(param.example)}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-white font-medium mb-3">Responses</h4>
                        <div className="space-y-4">
                            {Object.entries(endpoint.responses).map(([code, response]) => (
                                <div key={code} className="bg-gray-800/40 rounded-lg p-3 md:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                                            <span className={`px-2 py-1 rounded text-sm font-medium w-fit ${code.startsWith('2') ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                                }`}>
                                                {code}
                                            </span>
                                            <span className="text-gray-300 text-sm">{response.description}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2))}
                                            className="text-gray-400 hover:text-white transition-colors self-start sm:self-center"
                                            title="Copy response example"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="bg-gray-900 rounded p-2 md:p-3 overflow-x-auto">
                                        <pre className="text-xs md:text-sm text-gray-300">
                                            <code>{JSON.stringify(response.example, null, 2)}</code>
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};