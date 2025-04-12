import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    eslint: {
        // 프로덕션 빌드 시 ESLint 에러를 무시합니다.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
