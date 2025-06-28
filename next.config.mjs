/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de imagens (mantidas conforme seu original)
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
  },

  // Configurações experimentais (NOVO - essencial para middleware)
  experimental: {
    middleware: true,
    serverActions: true
  },

  // Configuração do TypeScript (mantida conforme seu original)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuração de redirecionamentos (mantida conforme seu original)
  async redirects() {
    return [];
  },

  // Configuração de output (mantida conforme seu original)
  output: "standalone",
  
  // Habilitar logging para debug (NOVO - ajuda a identificar problemas)
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
