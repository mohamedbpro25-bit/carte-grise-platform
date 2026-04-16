/** @type {import('next').NextConfig} */
const backendHostPort = process.env.BACKEND_HOSTPORT || 'localhost:4000'

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://${backendHostPort}/api/:path*`,
      },
    ]
  },
}
module.exports = nextConfig