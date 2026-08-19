/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://gearup-backend.hamzaasifghouri786.workers.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;