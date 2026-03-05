import { Rubik } from "next/font/google";
import "../styles/globals.css";
import { TRPCProvider } from "@/lib/trpc";
import { jsonLd } from "@/components/seo/metadata";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const rubik = Rubik({
    subsets: ['latin'],
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang="en" className="dark" suppressHydrationWarning>
                <head>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </head>
                <body
                    className={`${rubik.className} antialiased`}
                >
                    <TRPCProvider>
                        <TooltipProvider>
                            {children}
                        </TooltipProvider>
                    </TRPCProvider>
                    <Toaster theme={"dark"} />
                </body>
            </html>
        </>
    )
}