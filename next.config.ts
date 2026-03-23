import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "chart.js",
      "chartjs-plugin-zoom",
      "chartjs-adapter-date-fns",
      "@tanstack/react-table",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tooltip",
    ],
  },
};

export default nextConfig;
