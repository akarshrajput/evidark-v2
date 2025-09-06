import { Inter, Creepster, Nosifer } from "next/font/google";
import "./globals.css";
import DashboardSidebar from "./_components/main/DashboardSidebar";
import DashboardRightSidebar from "./_components/main/DashboardRightSidebar";
import TopNavigation from "./_components/main/TopNavigation";
import MobileNavigation from "./_components/main/MobileNavigation";
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
            {/* Mobile Navigation */}
            <MobileNavigation />

            {/* Desktop Layout - Fixed Professional Structure */}
            <div className="hidden lg:block fixed-layout">
              {/* Fixed Header */}
              <header className="fixed-header evidark-nav">
                <div className="px-6 py-2.5 h-full flex items-center">
                  <TopNavigation />
                </div>
              </header>

              {/* Fixed Left Sidebar */}
              <aside className="fixed-sidebar-left evidark-sidebar">
                <div className="h-full overflow-y-auto">
                  <DashboardSidebar />
                </div>
              </aside>

              {/* Fixed Main Content Area */}
              <main className="fixed-main-content bg-background">
                <div className="h-full overflow-y-auto">
                  <div className="px-8 py-8 min-h-full">{children}</div>
                </div>
              </main>

              {/* Fixed Right Sidebar */}
              <aside className="fixed-sidebar-right evidark-sidebar">
                <div className="h-full overflow-y-auto">
                  <DashboardRightSidebar />
                </div>
              </aside>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="pt-16 pb-20 min-h-screen px-4">{children}</div>
            </div>

            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#161b22",
                  color: "#f0f6fc",
                  border: "1px solid #30363d",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
                },
              }}
            />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
