import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "mmceupg1lfzrhi4n.public.blob.vercel-storage.com",
      "uvlpszptmegmljauzsry.supabase.co", // Supabase Storage ドメイン
    ],
  },
};

export default nextConfig;
