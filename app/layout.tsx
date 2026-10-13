import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import { Google_Sans_Flex, Literata } from "next/font/google";
import { home, site } from "@/content";
import "./globals.css";
import { Footer, Header } from "./components";
import { config } from "./config";
import Providers from "./providers";

const googleSansFlex = Google_Sans_Flex({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

// serif face for long-form reading in the chapter reader
const literata = Literata({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// site-wide defaults; each page overrides these through buildMetadata with copy from content/seo
export const metadata: Metadata = {
  metadataBase: new URL(config.platform),
  title: { default: home.title, template: `%s${site.titleSeparator}${site.name}` },
  description: home.description,
  keywords: home.keywords,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: home.title,
    description: home.description,
    images: [site.defaultImage],
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitterHandle,
    title: home.title,
    description: home.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} ${literata.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <InitColorSchemeScript attribute="class" />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
