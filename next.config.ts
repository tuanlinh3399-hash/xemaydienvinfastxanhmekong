import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  output: "standalone",

  generateBuildId: async () => {
    // Cố định Build ID để tránh lệch manifest trên server deploy chập chờn
    return 'vinfast-fixed-id';
  },
  experimental: {
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/chi-nhanh/hung-phu',
        destination: '/?branch=hung-phu',
        permanent: true,
      },
      {
        source: '/chi-nhanh/binh-thuy',
        destination: '/?branch=binh-thuy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
