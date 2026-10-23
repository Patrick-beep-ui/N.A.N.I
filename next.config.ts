import type { NextConfig } from "next";
const config: NextConfig = {
  agentRules: false,
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
};
export default config;
