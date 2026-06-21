import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import "@/lib/fontawesome-config";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import { getProfile } from "@/lib/db/queries";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Tracr",
  description: "Tracr, your job application tracker.",
  icons: {
    icon: [
      { url: "/tracr-black.png", media: "(prefers-color-scheme: light)" },
      { url: "/tracr-white.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/tracr-black.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  const profile = session ? await getProfile(session.user.id) : null;
  const savedTheme = profile?.theme ?? "system";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme={savedTheme} enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Footer />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
