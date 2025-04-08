/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.vistahost.com.br",
      },
    ],
  },

  typescript: {
    // ⚠️ Isso desativa a verificação de tipos durante o build
    ignoreBuildErrors: true,
  },

  // Configurando comportamento de rotas não encontradas
  async redirects() {
    return [];
  },

  // Garantir que o Next.js gere a página 404 estática
  output: 'standalone', // Ou 'export' se estiver gerando static sites
};

export default nextConfig;