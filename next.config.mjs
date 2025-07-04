/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.npiconsultoria.com.br', // Permite todos subdomínios
      },
      {
        protocol: "https",
        hostname: "cdn.vistahost.com.br",
      },
      {
        protocol: "https",
        hostname: "d1988evaubdc7a.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "npi-imoveis.s3.sa-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.uso.com.br",
      },
      {
        protocol: "https",
        hostname: "npi-imoveis.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "objectstorage.sa-saopaulo-1.oraclecloud.com",
      },
      {
        protocol: "https",
        hostname: "images.usenonstop.com.br",
      },
      {
        protocol: "https",
        hostname: "static.orulo.com.br",
      },
      {
        protocol: "https",
        hostname: "buildingeng.com.br",
      },
      {
        protocol: "https",
        hostname: "tresorresidence.com.br",
      },
      {
        protocol: "https",
        hostname: "veranosaopaulo.com",
      },
      {
        protocol: "https",
        hostname: "veranocampinas.com",
      },
      {
        protocol: "https",
        hostname: "cdn.imoview.com.br",
        pathname: "/**",
      },
    ],
    // Configuração importante para otimização
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60, // Cache de 60 segundos
  },
  typescript: {
    ignoreBuildErrors: true, // Apenas para desenvolvimento
  },
  async redirects( ) {
    return [
      // Esta seção está vazia para evitar conflitos com o middleware
      // que agora é responsável por lidar com os redirecionamentos de imóveis.
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Permite que o middleware seja executado antes dos redirecionamentos estáticos
        // (Esta seção pode ser usada para rewrites que precisam de alta precedência,
        // mas para o seu caso, o middleware já está lidando com a reescrita interna).
      ],
      afterFiles: [
        // Esta seção está vazia ou contém apenas rewrites que não conflitam
        // com as rotas de imóvel ou o middleware.
        // A regra anterior para '/imovel-:id' foi removida para evitar redundância
        // e possível conflito com o middleware.
      ],
    };
  },
  output: "standalone", // Ou 'export' se estiver gerando static sites
};

export default nextConfig;
