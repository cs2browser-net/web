import PageLayout from "@/components/layouts/PageLayout";
import Swiftly from '@/images/group/swiftlys2.png'
import CS2Browser from '@/images/group/cs2browser.png'
import Image from "next/image";
import Link from "next/link";

export default function Group() {
    return (
        <PageLayout>
            <div className="pt-8 pb-16 mx-2 md:mx-auto md:max-w-[75%]">
                <div className="text-center mb-8 px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Swiftly Group
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        The group from which this website is being contained in.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-colors">
                        <div className="aspect-video overflow-hidden">
                            <Image
                                src={Swiftly}
                                alt="swiftlys2.net"
                                width={400}
                                height={225}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-white">
                                SwiftlyS2
                            </h3>
                            <p className="text-[#00feed] hover:text-[#00d4c7] mb-3 text-sm transition-colors">
                                <Link href={"https://swiftlys2.net"} target="_blank" rel="noopener noreferrer">https://swiftlys2.net</Link>
                            </p>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                SwifltyS2 is a server modification plugin for Counter Strike 2 which is based on Metamod:Source.

                                This server modification platform allows plugins to be created easily, providing lightning-fast speed for your source code.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-colors">
                        <div className="aspect-video overflow-hidden">
                            <Image
                                src={CS2Browser}
                                alt="CS2Browser.net"
                                width={400}
                                height={225}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-white">
                                CS2 Server Browser
                            </h3>
                            <p className="text-[#00feed] hover:text-[#00d4c7] mb-3 text-sm transition-colors">
                                <Link href={"https://cs2browser.net"} target="_blank" rel="noopener noreferrer">https://cs2browser.net</Link>
                            </p>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Explore one of the most comprehensive Counter-Strike 2 server directories, with over 10,000 servers tracked.

                                Quickly find the perfect server with powerful filters by region, mode, or community favorites like Zombie Escape, Surf, BunnyHop, Retake, AWP, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}