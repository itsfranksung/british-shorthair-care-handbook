import type { NextConfig } from "next";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves this export from /<repository>/, while the page itself
  // is still built as the root route. Prefix assets without relocating the
  // route so the export always includes dist/client/index.html.
  assetPrefix: assetPrefix || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
