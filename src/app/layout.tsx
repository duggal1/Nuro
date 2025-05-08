import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/sonner-provider";
import FooterSection from '@/components/footer';
import { Providers } from '@/components/provider';
import FloatingChatbot from "@/components/chatbot/components/floating-chatbot";

export const metadata: Metadata = {
  title: "Nuro | EVO2 | Genomic Analysis",
  description: "Genomic variant analysis with advanced AI models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-serif antialiased",
          "dark:bg-black bg-white transition-colors duration-300" // Add transition
        )}
      >
        <Providers>
          <FloatingChatbot/>
          <main className="min-h-screen dark:bg-black bg-white">
            {children}
          </main>
          <Toaster />
        </Providers>
        <FooterSection />
      </body>
    </html>
  );
}
