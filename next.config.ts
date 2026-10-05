import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Recipe photos uploaded to Supabase Storage.
    remotePatterns: [
      new URL(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/**`,
      ),
    ],
  },
  async headers() {
    return [
      {
        // Always revalidate the service worker so updates roll out promptly.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
