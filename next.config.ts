import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.camptocamp.org",
        pathname: "/api/v1/images/proxy/**",
      },
      {
        protocol: "https",
        hostname: "media.camptocamp.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
