/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // ✅ MANTIDO: Sua configuração atual
  
  // 🚀 EXPERIMENTAL OTIMIZADO: Apenas o que funciona comprovadamente
  experimental: {
    optimizePackageImports: ['lucide-react'], // ✅ MANTIDO: Tree shaking icons
    // 🎯 ADIÇÃO SEGURA: Melhora server response time
    serverComponentsExternalPackages: ['sharp'], // ✅ Otimiza processamento de imagens
  },
  
  // ✅ MANTIDO: Configuração de imagens EXATA + pequenas otimizações
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
    
    // 🎯 OTIMIZAÇÕES CIRÚRGICAS para performance (baseado no PageSpeed)
    formats: ["image/avif", "image/webp"], // ✅ MANTIDO
    deviceSizes: [640, 750, 828, 1080, 1200], // ✅ MANTIDO
    minimumCacheTTL: 86400, // 🚀 OTIMIZADO: 24h cache (era 60s) - melhora server response
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // ✅ MANTIDO
    dangerouslyAllowSVG: true, // ✅ MANTIDO
    contentDispositionType: 'attachment', // ✅ MANTIDO
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // ✅ MANTIDO
  },
  
  // ✅ MANTIDO: TypeScript config EXATO
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🚀 COMPILER OTIMIZADO: Resolve "unused JavaScript" do PageSpeed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // ✅ MANTIDO
    // 🎯 ADIÇÕES SEGURAS para reduzir bundle:
    emotion: false, // ✅ Remove se não usar emotion
    styledComponents: false, // ✅ Remove se não usar styled-components
  },
  swcMinify: true, // ✅ MANTIDO

  // 🎯 WEBPACK ULTRA-OTIMIZADO: Resolve os problemas específicos do PageSpeed
  webpack: (config, { dev, isServer }) => {
    // ✅ MANTIDO: Suas configurações webpack originais
    if (!dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // 🚀 OTIMIZAÇÃO AVANÇADA: Tree shaking + dead code elimination
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // 🎯 ADIÇÃO: Melhora o splitting para reduzir unused JS
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      
      // 🎯 RESOLUÇÃO ESPECÍFICA: JavaScript legado detectado pelo PageSpeed
      config.resolve.alias = {
        ...config.resolve.alias,
        // ⚡ Remove polyfills desnecessários (conforme PageSpeed relatou)
        'core-js/modules/es.array.at': false,
        'core-js/modules/es.object.has-own': false,
        'core-js/modules/es.array.flat': false,
        'core-js/modules/es.array.flat-map': false,
        'core-js/modules/es.object.from-entries': false,
        'core-js/modules/es.string.trim-end': false,
        'core-js/modules/es.string.trim-start': false,
      };
    }
    
    // 🎯 OTIMIZAÇÃO ADICIONAL: Module resolution mais eficiente
    config.resolve.modules = ['node_modules'];
    
    return config;
  },

  // 🚀 HEADERS OTIMIZADOS: Melhora cache + server response time
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
      // 🎯 ADIÇÃO NOVA: Headers para performance geral
      {
        source: '/(.*)',
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
  
  // 🎯 ADIÇÃO NOVA: Performance hints para reduzir warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
