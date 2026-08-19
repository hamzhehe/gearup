/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://backend-psi-two-xd4abeghtg.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;