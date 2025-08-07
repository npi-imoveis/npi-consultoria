/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  
  // 🚀 EXPERIMENTAL CONSERVADOR
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
    
    // 🎯 FORMATOS OTIMIZADOS para qualidade
    formats: ["image/webp", "image/avif"],
    
    // 🔥 DEVICE SIZES OTIMIZADOS para fotos maiores
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    
    // 🎯 IMAGE SIZES EXPANDIDOS para melhor responsive
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768],
    
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
  
  // 🚀 HEADERS OTIMIZADOS para imagens
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
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
    ];
  },
  
  // ✅ MANTIDO: Redirects originais
  async redirects() {
    return [
      {
        source: '/iConatusIframe/:path*',
        destination: '/',
        permanent: true
      },
      {
        source: '/iframe.php',
        destination: '/',
        permanent: true
      },
    ];
  },
  
  // ✅ MANTIDO: Output
  output: "standalone",
};

export default nextConfig;
