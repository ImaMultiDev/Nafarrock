import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // i18n preparado para ES / EU / EN (fase futura)
  // experimental: { serverActions: true },
};

export default nextConfig;
