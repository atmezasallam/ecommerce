/** @type {import('next').NextConfig} */
// Dev port is fixed to 3000 via `npm run dev` → scripts/dev.sh (`next dev -p 3000`).
// Next.js does not support setting the dev server port in this file; use the CLI flag or PORT when starting.
//
// Dev 404 on /_next/static/chunks/main-app.js: stale .next after `next build`. Run `npm run clean:next` or restart via dev:win / scripts/dev.sh (they remove .next first).
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


