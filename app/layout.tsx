import type { Metadata } from "next";
import { headers } from "next/headers";
import { loadSettings } from "./lib/content";
import { ScrollToTop } from "./scroll-to-top";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, requestHeaders] = await Promise.all([
    loadSettings(),
    headers(),
  ]);
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const description = settings.introduction || settings.tagline;

  return {
    metadataBase: base,
    title: settings.lab_name || "Eusun Han's Lab",
    description,
    openGraph: {
      title: settings.lab_name || "Eusun Han's Lab",
      description,
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024 }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.lab_name || "Eusun Han's Lab",
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
