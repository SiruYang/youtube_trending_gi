import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube 封面的主要域名
        port: '',
        pathname: '/vi/**',
      },
    ],
  },
};

export default nextConfig;