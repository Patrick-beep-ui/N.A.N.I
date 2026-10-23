import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nani/contracts", "@nani/engine"]
};

export default nextConfig;
