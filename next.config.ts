import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // enables Server Actions + lets you configure limits
      bodySizeLimit: "10mb",        // ← bump from 1 MB to 10 MB
      // allowedOrigins?: string[]  // ← optionally, add custom origins
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, // ← Ignore TypeScript errors during build
  },
  async rewrites() {
    return [
      {
        source: '/ncbi-api/:path*',
        destination: 'https://eutils.ncbi.nlm.nih.gov/:path*',
      },
      {
        source: '/clinical-tables-api/:path*',
        destination: 'https://clinicaltables.nlm.nih.gov/:path*',
      },
      {
        source: '/genome-api/:path*',
        destination: 'https://api.genome.ucsc.edu/:path*',
      }
    ];
  },
};

export default nextConfig;