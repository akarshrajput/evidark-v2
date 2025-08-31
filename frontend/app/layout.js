import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./_components/main/Header";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "./_components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: " EviDark - Where Evidence Meets Darkness",
  description:
    "Professional dark stories platform - Uncover mysteries, share evidence-based narratives, and explore the shadows of truth.",
  keywords:
    "dark stories, mysteries, evidence, horror, supernatural, investigation, true crime",
  authors: [{ name: "EviDark Team" }],
  creator: "EviDark",
  publisher: "EviDark",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: " EviDark - Where Evidence Meets Darkness",
    description:
      "Professional dark stories platform - Uncover mysteries and explore evidence-based narratives.",
    url: "/",
    siteName: "EviDark",
    images: [
      {
        url: "/evidark.png",
        width: 1200,
        height: 630,
        alt: "EviDark - Dark Stories Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <QueryProvider>
          <AuthProvider>
            <div className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
              <Header />
            </div>
            <div className="pt-16">{children}</div>
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#111113",
                  color: "#e4e4e7",
                  border: "1px solid #27272a",
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
