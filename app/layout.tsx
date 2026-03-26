import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { home } from "@/content";
import "./globals.css";
import { Header } from "./components";
import { config } from "./config";
import Providers from "./providers";

const googleSansFlex = Google_Sans_Flex({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: home.title,
  description: home.description,
  openGraph: {
    title: home.title,
    description: home.description,
    images: [
      {
        url: `${config.platform}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Aura - A platform for writers and readers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: home.title,
    description: home.description,
  },
  keywords: home.keywords,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${googleSansFlex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
