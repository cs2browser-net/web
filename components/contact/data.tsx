import { Mail, MessageCircle } from "lucide-react";

export const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00feed] hover:text-[#00feed]/80 underline transition-colors"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};

export const contactMethods = [
    {
        icon: <Mail className="w-6 h-6" />,
        title: "Email Support",
        description: "Get in touch with our team for general inquiries and support",
        contact: "contact@cs2browser.net",
        action: "mailto:contact@cs2browser.net",
        actionText: "Send Email"
    },
    {
        icon: <MessageCircle className="w-6 h-6" />,
        title: "Discord Community",
        description: "Join our community for real-time discussions and updates",
        contact: "Discord Server",
        action: "https://cs2browser.net/discord",
        actionText: "Join Server"
    }
];

export const faqItems = [
    {
        question: "Are you collaborating with Gambling-related websites?",
        answer: "No, we do not collaborate with any gambling-related websites. We are committed to providing a safe and responsible platform for all users."
    },
    {
        question: "Can I use the API for commercial purposes?",
        answer: "No, our API is free to use for personal and non-commercial projects. Please be respectful with your usage and implement proper caching to avoid excessive requests."
    },
    {
        question: "How do you calculate ping estimates?",
        answer: "Ping estimates are calculated using the haversine formula based on the geographical distance between your location and the server location. These are estimates and actual ping may vary."
    },
    {
        question: "Why isn't my server showing up?",
        answer: "Servers appear automatically if they're publicly accessible and responding to queries. Private servers or those behind firewalls may not be discoverable. Contact us if you believe your server should be listed."
    }
];