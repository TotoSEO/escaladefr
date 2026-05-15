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
      // Marchands escalade
      { protocol: "https", hostname: "cdn.snowleader.com", pathname: "/**" },
      { protocol: "https", hostname: "img.snowleader.com", pathname: "/**" },
      { protocol: "https", hostname: "static.snowleader.com", pathname: "/**" },
      { protocol: "https", hostname: "www.snowleader.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.hardloop.fr", pathname: "/**" },
      { protocol: "https", hostname: "media.hardloop.fr", pathname: "/**" },
      { protocol: "https", hostname: "images.hardloop.fr", pathname: "/**" },
      { protocol: "https", hostname: "static.hardloop.fr", pathname: "/**" },
      { protocol: "https", hostname: "www.hardloop.fr", pathname: "/**" },
      { protocol: "https", hostname: "contents.mediadecathlon.com", pathname: "/**" },
      { protocol: "https", hostname: "www.decathlon.fr", pathname: "/**" },
      // Fabricants
      { protocol: "https", hostname: "www.lasportiva.com", pathname: "/**" },
      { protocol: "https", hostname: "media.lasportiva.com", pathname: "/**" },
      { protocol: "https", hostname: "www.scarpa.com", pathname: "/**" },
      { protocol: "https", hostname: "scarpa.com", pathname: "/**" },
      { protocol: "https", hostname: "www.scarpa.net", pathname: "/**" },
      { protocol: "https", hostname: "www.petzl.com", pathname: "/**" },
      { protocol: "https", hostname: "blackdiamondequipment.com", pathname: "/**" },
      { protocol: "https", hostname: "www.blackdiamondequipment.com", pathname: "/**" },
      { protocol: "https", hostname: "www.bealplanet.com", pathname: "/**" },
      { protocol: "https", hostname: "bealplanet.com", pathname: "/**" },
      { protocol: "https", hostname: "www.mammut.com", pathname: "/**" },
      { protocol: "https", hostname: "mammut.com", pathname: "/**" },
      { protocol: "https", hostname: "www.edelrid.com", pathname: "/**" },
      { protocol: "https", hostname: "edelrid.com", pathname: "/**" },
      { protocol: "https", hostname: "www.blueice.com", pathname: "/**" },
      { protocol: "https", hostname: "blueice.com", pathname: "/**" },
      { protocol: "https", hostname: "www.camp.it", pathname: "/**" },
      { protocol: "https", hostname: "camp.it", pathname: "/**" },
      { protocol: "https", hostname: "www.wildcountry.com", pathname: "/**" },
      { protocol: "https", hostname: "www.dmmwales.com", pathname: "/**" },
      { protocol: "https", hostname: "www.tenayaclimbing.com", pathname: "/**" },
      { protocol: "https", hostname: "tenayaclimbing.com", pathname: "/**" },
      { protocol: "https", hostname: "www.adidas.fr", pathname: "/**" },
      { protocol: "https", hostname: "assets.adidas.com", pathname: "/**" },
      { protocol: "https", hostname: "www.adidas-fiveten.com", pathname: "/**" },
      { protocol: "https", hostname: "www.ocun.com", pathname: "/**" },
      { protocol: "https", hostname: "ocun.com", pathname: "/**" },
      // Wikipedia (fallback)
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
    ],
  },
};

export default nextConfig;
