/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily disable TypeScript errors for production build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
