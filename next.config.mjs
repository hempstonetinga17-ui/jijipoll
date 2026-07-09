/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  webpack: (config) => {
    // Leaflet requires these to be handled by webpack
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
