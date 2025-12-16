/** @type {import('next').NextConfig} */
const nextConfig = {
  // This makes the build smaller and more stable for Docker
  output: "standalone",
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;