import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for build since we have Puppeteer
  webpack: (config) => {
    // Support for Puppeteer and other native modules
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  // Configure API routes
  async rewrites() {
    return [];
  },
};

export default nextConfig;
