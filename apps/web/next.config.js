/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@recon/shared'],
};

module.exports = nextConfig;
