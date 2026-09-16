import type { Metadata } from "next";
import { Lato, Montserrat } from "next/font/google";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Vivaboss Fusion Services | Craft. Home. Delivery.",
    template: "%s | Vivaboss Fusion",
  },
  description:
    `${siteConfig.fashionPunchline} Fashion, personalised gifts, smart home, home services, and courier across the UK.`,
  applicationName: siteConfig.shortName,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Vivaboss Fusion Services",
    description: siteConfig.fashionPunchline,
    url: "/",
    siteName: "Vivaboss Fusion Services",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivaboss Fusion Services",
    description: siteConfig.fashionPunchline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${montserrat.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-vb-ink focus:px-4 focus:py-2 focus:font-heading focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.16em] focus:text-vb-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
