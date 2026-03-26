import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@notionhq/client", "notion-to-md"],
};

export default nextConfig;
