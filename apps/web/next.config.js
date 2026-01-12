/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@recon/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'financialmodelingprep.com',
      },
    ],
  },
};

module.exports = nextConfig;
