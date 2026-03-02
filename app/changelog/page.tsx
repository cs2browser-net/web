"use client";

import { changelog, getTypeColor, getTypeIcon, getTypeName, hasChanges } from "@/components/changelog/data";
import PageLayout from "@/components/layouts/PageLayout";
import { Badge } from "@/components/ui/badge";

// export const metadata: Metadata = {
//     ...defaultMetadata,
//     title: "CS2Browser.net - Find Counter-Strike 2 servers",
// }

// export const viewport: Viewport = defaultViewport

export default function ChangelogPage() {

    return (
        <PageLayout>
            <div className="flex flex-col justify-between mx-2 md:mx-auto md:max-w-[80%] items-center">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                        Changelog
                    </h1>
                    <p className="text-gray-400 text-md max-w-2xl mx-auto">
                        Track all the latest updates, improvements, and new features added to CS2Browser.net.
                    </p>
                </div>

                <div className="w-full mx-auto space-y-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {changelog.filter(hasChanges).map((entry, entryIndex) => (
                        <div
                            key={entryIndex}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                    {entry.version && (
                                        <span className="text-[#00feed] font-mono text-lg font-semibold">
                                            v{entry.version}
                                        </span>
                                    )}
                                    <h2 className="text-2xl font-semibold text-white items-center flex gap-2">
                                        Release Update {(entryIndex == 0 ? <Badge variant={"default"} className="h-fit">Latest Release</Badge> : null)}
                                    </h2>
                                </div>
                                <time className="text-gray-400 text-sm">
                                    {new Date(entry.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </time>
                            </div>

                            <div className="space-y-8">
                                {(Object.keys(entry.changes) as Array<keyof typeof entry.changes>).map((changeType) => {
                                    const changes = entry.changes[changeType];
                                    if (!changes || changes.length === 0) return null;

                                    return (
                                        <div key={changeType} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(changeType)}`}
                                                >
                                                    {getTypeIcon(changeType)} {getTypeName(changeType)}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    {changes.length} {changes.length === 1 ? 'change' : 'changes'}
                                                </span>
                                            </div>

                                            <div className="ml-4 space-y-4">
                                                {changes.map((change, changeIndex) => (
                                                    <div key={changeIndex} className="border-l-2 border-gray-700/50 pl-4">
                                                        <h4 className="text-lg font-semibold text-white mb-2">
                                                            {change.title}
                                                        </h4>
                                                        <p className="text-gray-300 mb-3">
                                                            {change.description}
                                                        </p>

                                                        {change.details && (
                                                            <ul className="space-y-1">
                                                                {change.details.map((detail, detailIndex) => (
                                                                    <li
                                                                        key={detailIndex}
                                                                        className="text-gray-400 text-sm flex items-start"
                                                                    >
                                                                        <span className="text-[#00feed] mr-2 mt-1.5 w-1 h-1 rounded-full bg-[#00feed] flex-shrink-0"></span>
                                                                        {detail}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8 pb-8 w-full">
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 mx-auto">
                        <p className="text-gray-400 text-sm mb-2">
                            Want to stay updated?
                        </p>
                        <p className="text-gray-500 text-xs">
                            Bookmark this page to keep track of the latest changes and improvements.
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}