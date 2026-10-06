import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SiteFooter } from "@/components/Footer";
import { SITE } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

const ogImage = {
  url: SITE.ogImage.url,
  width: SITE.ogImage.width,
  height: SITE.ogImage.height,
  alt: 'Legal Connect: from a stressful search for a lawyer to a confirmed match with a qualified attorney.',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  manifest: "/manifest.webmanifest",
  applicationName: SITE.name,
  title: {
    default: 'Legal Connect | Find an attorney. Describe your issue once.',
    template: '%s | Legal Connect',
  },
  description: SITE.description,
  keywords: [
    'find an attorney',
    'legal intake',
    'attorney matching',
    'conflict of interest check',
    'find a lawyer online',
    'legal help',
  ],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'en_US',
    title: 'Legal Connect | Find an attorney. Describe your issue once.',
    description: SITE.description,
    url: '/',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Connect | Find an attorney. Describe your issue once.',
    description: SITE.description,
    images: [ogImage.url],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export const viewport: Viewport = {
  themeColor: "#08111f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-ink focus:shadow-lg"
        >
          Skip to content
        </a>
        <AuthProvider>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
