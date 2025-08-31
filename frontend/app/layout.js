import { Inter, Creepster, Nosifer } from "next/font/google";
import "./globals.css";
import Header from "./_components/main/Header";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryProvider from "./_components/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const creepster = Creepster({
  variable: "--font-creepster",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const nosifer = Nosifer({
  variable: "--font-nosifer",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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
        className={`${inter.variable} ${creepster.variable} ${nosifer.variable} font-inter antialiased min-h-screen bg-background text-foreground`}
      >
        <QueryProvider>
          <AuthProvider>
            <div className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-none shadow-2xl shadow-black/50">
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
                  border: "none",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(220, 38, 38, 0.2)",
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
