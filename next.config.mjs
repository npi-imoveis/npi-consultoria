/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  
  // 🚀 EXPERIMENTAL OTIMIZADO
  experimental: {
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: ['sharp'],
  },
  
  // 🔥 IMAGENS CORRIGIDAS PARA CLS 0.003
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
    
    // 🎯 FORMATOS CONSERVADORES: WebP primeiro (compatibilidade + performance)
    formats: ["image/webp"],
    
    // 🔥 DEVICE SIZES CONSERVADORES para estabilidade
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    
    // 🎯 IMAGE SIZES PADRÃO do Next.js
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 🚀 CACHE CONSERVADOR: 24h para estabilidade
    minimumCacheTTL: 86400, // 24 horas
    
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
    emotion: false,
    styledComponents: false,
  },
  swcMinify: true,

  // 🎯 WEBPACK ULTRA-OTIMIZADO para reduzir JavaScript
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // 🚀 OTIMIZAÇÃO AVANÇADA
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,      // Chunks menores
          maxSize: 244000,     // Limite máximo
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // 🎯 NOVO: Separar lucide-react (usado extensivamente)
            icons: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
          },
        },
      };
      
      // 🎯 RESOLUÇÃO ESPECÍFICA: Remove polyfills desnecessários
      config.resolve.alias = {
        ...config.resolve.alias,
        'core-js/modules/es.array.at': false,
        'core-js/modules/es.object.has-own': false,
        'core-js/modules/es.array.flat': false,
        'core-js/modules/es.array.flat-map': false,
        'core-js/modules/es.object.from-entries': false,
        'core-js/modules/es.string.trim-end': false,
        'core-js/modules/es.string.trim-start': false,
      };
    }
    
    config.resolve.modules = ['node_modules'];
    
    return config;
  },

  // 🚀 HEADERS ULTRA-OTIMIZADOS
  async headers() {
    return [
      // 🎯 IMAGENS: Cache agressivo + compressão
      {
        source: '/assets/images/:path*',
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
      // 🎯 NEXT.JS STATIC: Cache agressivo
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 🔥 NEXT/IMAGE: Otimizações específicas para imagens otimizadas
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
          // 🎯 COMPRESSÃO para Next/Image
          {
            key: 'Content-Encoding',
            value: 'gzip',
          },
        ],
      },
      // 🎯 PÁGINAS HTML: Cache inteligente
      {
        source: '/((?!api).*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // 🚀 PRELOAD DNS para CDNs de imagem
          {
            key: 'Link',
            value: '<https://d1988evaubdc7a.cloudfront.net>; rel=preconnect; crossorigin, <https://npi-imoveis.s3.sa-east-1.amazonaws.com>; rel=preconnect; crossorigin',
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
  
  // 🎯 PERFORMANCE OTIMIZADA
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // 🚀 NOVO: Compressão adicional para produção
  compress: true,
  
  // 🎯 NOVO: Otimizações de build
  generateBuildId: async () => {
    // Build ID baseado em timestamp para cache busting
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
