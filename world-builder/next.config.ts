import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: false,
    eslint: {
        // Ignore ESLint errors during production builds.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
