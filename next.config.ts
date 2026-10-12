import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: the home directory (this repo's parent) has an
  // unrelated package-lock.json that Turbopack would otherwise pick up as a
  // false monorepo root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
