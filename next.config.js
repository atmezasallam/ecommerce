/** @type {import('next').NextConfig} */
// If /_next/static assets 404 after switching between `next build` and `next dev`,
// delete the stale cache: `node scripts/clean-next.cjs`
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@tremor/react",
      "swiper",
      "@radix-ui/react-icons",
      "date-fns",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
       
      },

      {
        protocol: 'https',
        hostname: 'img.clerk.com',
       
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;


