/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Suas configurações existentes de imagens...
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Configuração atualizada para Next.js 14
    middlewarePrefetch: 'strict',
    // Removido incrementalCacheHandlerPath
  },
  output: "standalone",
};

export default nextConfig;
