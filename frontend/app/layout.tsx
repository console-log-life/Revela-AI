import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { appDescription, appName } from "@/lib/constants";
import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"]
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} | Adaptive Hiring Intelligence`,
    template: `%s | ${appName}`
  },
  description: appDescription,
  applicationName: appName,
  openGraph: {
    title: `${appName} | Adaptive Hiring Intelligence`,
    description: appDescription,
    type: "website",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} | Adaptive Hiring Intelligence`,
    description: appDescription
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        <Providers>
          <div className="fixed inset-0 -z-10 bg-hero-radial" />
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(244,114,182,0.12),transparent_22%),radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.08),transparent_28%)]" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
