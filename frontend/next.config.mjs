/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050",
  },
  serverExternalPackages: ["mongoose"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "*.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "qjpplmklqgtqkxoxcanx.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "*.imgur.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "cdnjs.cloudflare.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5050",
      },
      // Allow any HTTPS domain for user-uploaded images
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
