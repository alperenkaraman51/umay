/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/umay',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
