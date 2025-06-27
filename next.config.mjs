/** @type {import('next').NextConfig} */
const nextConfig = {
  // =============================================
  // 1. Configurações de Imagens (mantidas do seu original)
  // =============================================
  images: {
    remotePatterns: [
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
    minimumCacheTTL: 3600, // Cache mínimo de 1 hora
  },

  // =============================================
  // 2. Configurações para Grande Escala (7.000+ URLs)
  // =============================================
  async headers() {
    return [
      {
        source: '/api/get-slug-by-id/:id*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=7200'
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, max-age=3600'
          }
        ],
      },
    ];
  },

  // =============================================
  // 3. Otimizações de Performance
  // =============================================
  experimental: {
    // Habilitar para melhor performance com muitos redirecionamentos
    optimizeServerReact: true,
    instrumentationHook: true, // Para monitoramento
    optimizePackageImports: ['@prisma/client'], // Se estiver usando Prisma
    
    // Otimizações para Middleware
    middlewarePrefetch: 'flexible',
    incrementalCacheHandlerPath: './cache-handler.js', // Opcional para cache customizado
  },

  // =============================================
  // 4. Configurações Específicas para Middleware
  // =============================================
  skipMiddlewareUrlNormalize: true, // Melhor performance para muitos redirecionamentos
  skipTrailingSlashRedirect: true,  // Evita conflitos com o middleware

  // =============================================
  // 5. Controle de Build e TypeScript
  // =============================================
  typescript: {
    ignoreBuildErrors: true, // Mantido conforme sua configuração
  },

  // =============================================
  // 6. Saída e Configurações de Deploy
  // =============================================
  output: "standalone",
  productionBrowserSourceMaps: false, // Desativado para melhor performance
  
  // =============================================
  // 7. Redirecionamentos (VAZIO - tratados no middleware)
  // =============================================
  async redirects() {
    return []; // Todos os redirecionamentos são tratados no middleware
  },

  // =============================================
  // 8. Configurações de Log (Opcional)
  // =============================================
  logging: {
    fetches: {
      fullUrl: true, // Log completo para debugging
    },
  },
};

export default nextConfig;
