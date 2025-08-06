/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // ✅ MANTIDO: Sua configuração atual
  
  // ✅ MANTIDO: Apenas experimentais que já funcionavam
  experimental: {
    optimizePackageImports: ['lucide-react'], // 🚀 Tree shaking icons (mantido - já funcionava)
    // ❌ REMOVIDO: optimizeCss (causava erro 'critters')
  },
  
  // ✅ MANTIDO: Configuração de imagens EXATA da sua versão original
  images: {
    // ✅ MANTIDO: Todos os remotePatterns existentes (zero mudanças)
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
    
    // ✅ MANTIDO: Configurações EXATAS da sua versão original
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60, // Cache de 60 segundos
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ✅ MANTIDO: TypeScript config EXATO
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ MANTIDO: Configurações EXATAS da sua versão original
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,

  // 🎯 WEBPACK ULTRA CONSERVADOR: APENAS os polyfills essenciais
  webpack: (config, { dev, isServer }) => {
    // ✅ MANTIDO: Suas configurações webpack originais
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
      
      // 🎯 ADIÇÃO MÍNIMA: APENAS os 7 polyfills do PageSpeed (sem outras experimentações)
      config.resolve.alias = {
        ...config.resolve.alias,
        
        // ⚡ APENAS os polyfills confirmados no PageSpeed (sem mudanças no target)
        'core-js/modules/es.array.at': false,
        'core-js/modules/es.object.has-own': false,
        'core-js/modules/es.array.flat': false,
        'core-js/modules/es.array.flat-map': false,
        'core-js/modules/es.object.from-entries': false,
        'core-js/modules/es.string.trim-end': false,
        'core-js/modules/es.string.trim-start': false,
      };
    }
    
    return config;
  },

  // ✅ MANTIDO: Headers EXATOS da sua versão original
  async headers() {
    return [
      {
        source: '/assets/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
  
  // ✅ MANTIDO: Redirects EXATOS da sua versão original
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
  
  // ✅ MANTIDO: Output EXATO da sua versão original
  output: "standalone",
};

export default nextConfig;
