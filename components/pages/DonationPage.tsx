import { costs, totalMaxCost, totalMinCost } from "@/lib/donations/data";
import { Card } from "../ui/card";

export default function DonationPage() {
    return (
        <div>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold mb-4">Support CS2Browser.net</h1>
                <p className="text-lg text-muted-foreground mb-6">
                    Help us keep the Counter-Strike 2 server browser running and continuously improve the service for the community.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">Make a Donation</h2>
                        <p className="text-muted-foreground">
                            Your support helps us cover server costs and maintain this free service for the CS2 community.
                        </p>

                        <div className="border-gray-900 rounded-lg text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">Steam Trade Offer</h3>
                            <p className="text-gray-200 text-sm mb-4">
                                Support us by sending CS2 skins or items through Steam trade.
                            </p>
                            <a
                                href="https://steamcommunity.com/tradeoffer/new/?partner=1139088750&token=9defPx3R"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-[#66c0f4] hover:bg-[#4ea5d9] text-[#1b2838] rounded-lg transition-colors duration-200 font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 65 65" fill="#fff"><use xlinkHref="#B" x=".5" y=".5" /><defs><linearGradient id="A" x2="50%" x1="50%" y2="100%" y1="0%"><stop stop-color="#111d2e" offset="0%" /><stop stop-color="#051839" offset="21.2%" /><stop stop-color="#0a1b48" offset="40.7%" /><stop stop-color="#132e62" offset="58.1%" /><stop stop-color="#144b7e" offset="73.8%" /><stop stop-color="#136497" offset="87.3%" /><stop stop-color="#1387b8" offset="100%" /></linearGradient></defs><symbol id="B"><g><path d="M1.305 41.202C5.259 54.386 17.488 64 31.959 64c17.673 0 32-14.327 32-32s-14.327-32-32-32C15.001 0 1.124 13.193.028 29.874c2.074 3.477 2.879 5.628 1.275 11.328z" fill="url(#A)" /><path d="M30.31 23.985l.003.158-7.83 11.375c-1.268-.058-2.54.165-3.748.662a8.14 8.14 0 0 0-1.498.8L.042 29.893s-.398 6.546 1.26 11.424l12.156 5.016c.6 2.728 2.48 5.12 5.242 6.27a8.88 8.88 0 0 0 11.603-4.782 8.89 8.89 0 0 0 .684-3.656L42.18 36.16l.275.005c6.705 0 12.155-5.466 12.155-12.18s-5.44-12.16-12.155-12.174c-6.702 0-12.155 5.46-12.155 12.174zm-1.88 23.05c-1.454 3.5-5.466 5.147-8.953 3.694a6.84 6.84 0 0 1-3.524-3.362l3.957 1.64a5.04 5.04 0 0 0 6.591-2.719 5.05 5.05 0 0 0-2.715-6.601l-4.1-1.695c1.578-.6 3.372-.62 5.05.077 1.7.703 3 2.027 3.696 3.72s.692 3.56-.01 5.246M42.466 32.1a8.12 8.12 0 0 1-8.098-8.113 8.12 8.12 0 0 1 8.098-8.111 8.12 8.12 0 0 1 8.1 8.111 8.12 8.12 0 0 1-8.1 8.113m-6.068-8.126a6.09 6.09 0 0 1 6.08-6.095c3.355 0 6.084 2.73 6.084 6.095a6.09 6.09 0 0 1-6.084 6.093 6.09 6.09 0 0 1-6.081-6.093z" /></g></symbol></svg>
                                Send Trade Offer
                            </a>
                        </div>

                        <div className="w-full rounded-lg overflow-hidden border border-border bg-card">
                            <iframe
                                id="kofiframe"
                                src="https://ko-fi.com/swiftlygroup/?hidefeed=true&widget=true&embed=true&preview=true"
                                style={{
                                    border: 'none',
                                    width: '100%',
                                    display: 'block'
                                }}
                                height="580"
                                title="swiftlygroup"
                                className="rounded-lg"
                            />
                        </div>
                    </Card>
                </div>

                <div className="space-y-9.5">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">Monthly Operating Costs</h2>
                        <div className="space-y-4">
                            {costs.map((cost, index) => (
                                <div key={index} className="border-l-2 border-primary/20 pl-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium">{cost.service}</h3>
                                        <span className="text-primary font-semibold">{cost.monthlyFee}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">{cost.description}</p>
                                    <p className="text-xs text-muted-foreground/80">Provider: {cost.provider}</p>
                                </div>
                            ))}

                            <div className="border-t pt-4 mt-6">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Total Monthly Cost:</span>
                                    <span className="text-primary">${totalMinCost}-${totalMaxCost}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-3">Why Donate?</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                Keep the service free for everyone
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                Maintain reliable server uptime
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                Cover hosting and infrastructure costs
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                Enable new features and improvements
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-3">Thank You!</h3>
                        <p className="text-muted-foreground">
                            Every donation, no matter the size, helps us maintain and improve CS2Browser.net.
                            We{"'"}re grateful for your support and for being part of our community.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}