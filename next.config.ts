import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  rewrites: () => {
    return [
      {
        source: "/banners/:serverid/big.png",
        destination: "/api/banners/:serverid/big",
      },
      {
        source: "/banners/:serverid/small.png",
        destination: "/api/banners/:serverid/small",
      },
    ];
  }
};

export default nextConfig;
