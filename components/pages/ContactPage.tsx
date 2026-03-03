import Link from "next/link";
import { contactMethods, faqItems, renderTextWithLinks } from "../contact/data";
import { Button } from "../ui/button";
import { AlertCircle, ExternalLink } from "lucide-react";

export default function Contact() {
    return (
        <div className="w-full">
            <div className="text-center mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl lg:text-4xl font-semibold text-white mb-4">
                    Contact Us
                </h1>
                <p className="text-base md:text-xl lg:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                    Have questions, feedback, or need support?<br />We{"'"}d love to hear from you.
                    Choose the best way to get in touch below.
                </p>
            </div>

            <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {faqItems.map((item, index) => (
                        <div key={index} className="pb-4 last:border-b-0 last:pb-0">
                            <h3 className="text-white font-medium mb-2 text-sm md:text-base">
                                {item.question}
                            </h3>
                            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                                {renderTextWithLinks(item.answer)}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-4 bg-gray-800/40 rounded-lg border border-gray-700/30">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-500 font-medium text-sm mb-1">
                                Still have questions?
                            </p>
                            <p className="text-gray-300 text-xs md:text-sm">
                                Don{"'"}t hesitate to reach out using any of the contact methods above.
                                We{"'"}re here to help and typically respond within 24 hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full mb-6">
                {contactMethods.map((method, index) => (
                    <div key={index} className="bg-gray-900/30 backdrop-blur-sm w-full rounded-lg border border-gray-700/50 p-6 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center mb-4">
                            <div className="bg-[#00feed]/10 rounded-lg p-3 mr-4">
                                <div className="text-[#00feed]">
                                    {method.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">{method.title}</h3>
                        </div>
                        <p className="text-gray-300 mb-4 text-sm md:text-base">
                            {method.description}
                        </p>
                        <p className="text-[#00feed] font-mono text-sm mb-4">
                            {method.contact}
                        </p>
                        <Link href={method.action}>
                            <Button className="cursor-pointer w-full bg-transparent border border-[#00feed] text-[#00feed] hover:bg-[#00feed] hover:text-black transition-colors flex items-center justify-center space-x-2">
                                <span>{method.actionText}</span>
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}