import type { NextConfig } from "next";
import { legacyRedirects } from "./src/lib/redirects";
import { missingLegacyRedirects } from "./src/lib/legacy-fallback";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  async redirects() {
    return [...legacyRedirects(), ...missingLegacyRedirects()];
  },
  async headers() {
    return [
      {
        source: "/go/:partner",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
