/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: "veranosaopaulo.com/",
      },
      {
        protocol: "https",
        hostname: "cdn.imoview.com.br",
        pathname: "/**", // <--- ALTERE ESTA LINHA PARA COBRIR TODOS OS CAMINHOS
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
  output: "standalone", // Ou 'export' se estiver gerando static sites
};

export default nextConfig;
