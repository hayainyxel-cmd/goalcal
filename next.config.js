/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['twilio', 'node-cron'],
  },
}

module.exports = nextConfig
