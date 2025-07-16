/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // Mantém sua configuração atual
  
  // ✅ SOLUÇÃO DEFINITIVA: Desabilita redirects automáticos de trailing slash
  experimental: {
    skipTrailingSlashRedirect: true, // Deixa o middleware gerenciar tudo
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.npiconsultoria.com.br", // Permite todos subdomínios
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
    // Configuração de otimização de imagens
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60, // Cache de 60 segundos
  },
  
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Remover em produção
  },
  
  async redirects() {
    return [
      // 🚫 Bloquear/Redirecionar URLs do iframe antigo (WordPress)
      {
        source: '/iConatusIframe/:path*',
        destination: '/',
        permanent: true // 301 para homepage ou página apropriada
      },
      {
        source: '/iframe.php',
        destination: '/',
        permanent: true
      },
      // Seus outros redirects específicos podem ficar aqui
    ];
  },
  
  output: "standalone", // Para builds containerizadas
};

export default nextConfig;
