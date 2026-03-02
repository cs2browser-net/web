import { allCategories, gamemodeToSlug, mainCategories } from "@/lib/filters/gamemodes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronUp } from "lucide-react";

export default function Gamemodes({ gamemode }: { gamemode?: string }) {
    const [showAll, setShowAll] = useState(false);

    const router = useRouter();

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 mt-4 rounded-xl overflow-hidden mb-4">
            <div className="px-3 md:px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full mx-auto">
                    {showAll ? (
                        <div className="flex flex-col gap-3 w-full">
                            {allCategories.map((row, rowIndex) => (
                                <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-10 gap-2 md:gap-4">
                                    {row.map((category, colIndex) =>
                                        category ? (
                                            <Button
                                                key={`${rowIndex}-${colIndex}`}
                                                variant="ghost"
                                                className={`
                        h-10 md:h-12 px-2 md:px-4 rounded-lg transition-all duration-200 border-2 text-xs md:text-sm font-medium cursor-pointer
                        ${gamemode === gamemodeToSlug(category)
                                                        ? 'bg-[#00feed] hover:bg-[#00d4c7] text-black border-[#00feed] shadow-lg shadow-[#00feed]/20'
                                                        : 'bg-gray-800/60 hover:bg-gray-700/80 text-white border-gray-700/50 hover:border-gray-600'
                                                    }
                      `}
                                                onClick={() => {
                                                    if (gamemode != gamemodeToSlug(category)) router.push(`/gamemode/${gamemodeToSlug(category)}`)
                                                    else router.push("/")
                                                }}
                                            >
                                                <span className="truncate">{category}</span>
                                            </Button>
                                        ) : (
                                            <div key={`${rowIndex}-${colIndex}`} className="hidden md:block" />
                                        )
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                onClick={() => setShowAll(!showAll)}
                                className={`
                    h-10 md:h-12 px-4 md:px-6 rounded-lg transition-all duration-200 border-2 text-xs md:text-sm font-medium w-full md:w-auto md:min-w-[110px] cursor-pointer
                    bg-gray-800/60 hover:bg-gray-700/80 text-white border-gray-700/50 hover:border-gray-600
                  `}
                            >
                                <span className="mr-2">Less</span>
                                <div className={`transition-transform duration-300 rotate-180`}>
                                    <ChevronUp className="w-4 h-4" />
                                </div>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3 flex-1">
                                {mainCategories.map((category) => (
                                    <Button
                                        key={category}
                                        variant="ghost"
                                        className={`
                                        h-10 md:h-12 px-2 md:px-6 rounded-lg transition-all duration-200 border-2 text-xs md:text-sm font-medium md:min-w-[110px] cursor-pointer
                                        ${gamemode === gamemodeToSlug(category)
                                                ? 'bg-[#00feed] hover:bg-[#00d4c7] text-black border-[#00feed] shadow-lg shadow-[#00feed]/20'
                                                : 'bg-gray-800/60 hover:bg-gray-700/80 text-white border-gray-700/50 hover:border-gray-600'
                                            }`}
                                        onClick={() => {
                                            if (gamemode != gamemodeToSlug(category)) router.push(`/gamemode/${gamemodeToSlug(category)}`)
                                            else router.push("/")
                                        }}
                                    >
                                        <span className="truncate">{category}</span>
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => setShowAll(!showAll)}
                                className={`
                    h-10 md:h-12 px-4 md:px-6 rounded-lg transition-all duration-200 border-2 text-xs md:text-sm font-medium w-full md:w-auto md:min-w-[110px] cursor-pointer
                    ${showAll
                                        ? 'bg-[#00feed] hover:bg-[#00d4c7] text-black border-[#00feed] shadow-lg shadow-[#00feed]/20'
                                        : 'bg-gray-800/60 hover:bg-gray-700/80 text-white border-gray-700/50 hover:border-gray-600'
                                    }
                  `}
                            >
                                <span className="mr-2">More</span>
                                <div className={`transition-transform duration-300`}>
                                    <ChevronUp className="w-4 h-4" />
                                </div>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div >
    )
}