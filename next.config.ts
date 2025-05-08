import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
  
      bodySizeLimit: "10mb",       
     
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
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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