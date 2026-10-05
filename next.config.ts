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
};

export default nextConfig;
