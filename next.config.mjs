/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  
  // 🚨 ADIÇÃO CIRÚRGICA: Permitir que middleware controle trailing slash
  skipTrailingSlashRedirect: true,
  
  // 🚀 EXPERIMENTAL SEGURO (sem optimizeCss)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // 🔥 IMAGENS OTIMIZADAS PARA FOTOS MAIORES
  images: {
    // ✅ MANTIDO: Todos os remotePatterns existentes
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.npiconsultoria.com.br",
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
        hostname: "sigasp.com.br",
      },      
      {
        protocol: "https",
        hostname: "cdn.imoview.com.br",
        pathname: "/**",
      },
    ],
    
    // 🎯 FORMATOS PADRÃO Next.js (estabilidade garantida)
    formats: ["image/webp"],
    
    // 🔥 DEVICE SIZES PADRÃO Next.js
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    
    // 🎯 IMAGE SIZES PADRÃO Next.js
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 🚀 CACHE OTIMIZADO
    minimumCacheTTL: 60,
    
    // ✅ MANTIDO: Configurações de segurança
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ✅ MANTIDO: TypeScript config
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🚀 COMPILER OTIMIZADO
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  
  // 🎯 WEBPACK CONSERVADOR
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // 🚀 HEADERS ESSENCIAIS 
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // 🧹 REDIRECTS REMOVIDOS: iConatusIframe já não aparece mais na lista noindex (0 URLs)
  // async redirects() { return []; },
  
  // ✅ MANTIDO: Output
  output: "standalone",
};
export default nextConfig;
