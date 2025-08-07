/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  
  // 🚀 EXPERIMENTAL FEATURES PARA PERFORMANCE
  experimental: {
    optimizePackageImports: ['lucide-react'],
    scrollRestoration: true,
    // 🔧 REMOVIDO: optimizeCss (requer critters dependency)
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'FCP', 'TTFB'],
  },
  
  // 🔥 COMPRESSÃO AUTOMÁTICA
  compress: true,
  
  // 🎯 IMAGENS ULTRA-OTIMIZADAS
  images: {
    // ✅ FORMATOS MODERNOS (WebP + AVIF = -30% tamanho)
    formats: ["image/avif", "image/webp"],
    
    // 🔥 DEVICE SIZES OTIMIZADOS (reduz variações desnecessárias)
    deviceSizes: [640, 828, 1200, 1920],
    
    // 🎯 IMAGE SIZES FOCADOS (apenas os necessários)
    imageSizes: [16, 32, 64, 128, 256],
    
    // 🚀 CACHE AGRESSIVO (1 dia em produção)
    minimumCacheTTL: 86400,
    
    // ✅ MANTIDOS: Todos os remotePatterns existentes
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
    
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🔥 COMPILER AGRESSIVO
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false, // Remove se não usar
  },
  swcMinify: true,
  
  // 🚀 WEBPACK ULTRA-OTIMIZADO
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // 🔥 SPLIT CHUNKS OTIMIZADO
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // 🎯 CHUNK ESPECÍFICO PARA LUCIDE (muito usado)
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            chunks: 'all',
            priority: 20,
          },
        },
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // 🔥 HEADERS ULTRA-OTIMIZADOS
  async headers() {
    return [
      {
        // 🚀 HEADERS GLOBAIS DE PERFORMANCE
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // 🔥 CRITICAL: Early Hints para recursos importantes
          {
            key: 'Link',
            value: '</static/fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'
          }
        ],
      },
      {
        // 🔥 CACHE AGRESSIVO PARA ESTÁTICOS
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 🔥 CACHE OTIMIZADO PARA IMAGENS
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      {
        // 🎯 PRECONNECT PARA DOMÍNIOS EXTERNOS
        source: '/imovel-:id/:slug*',
        headers: [
          {
            key: 'Link',
            value: '<https://npi-imoveis.s3.sa-east-1.amazonaws.com>; rel=preconnect, <https://cdn.vistahost.com.br>; rel=preconnect, <https://d1988evaubdc7a.cloudfront.net>; rel=preconnect'
          }
        ],
      },
    ];
  },
  
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
  
  output: "standalone",
  
  // 🔥 POWEREDBYHEADER REMOVIDO (reduz overhead)
  poweredByHeader: false,
  
  // 🚀 GENERATE ETAGS OTIMIZADO
  generateEtags: true,
};

export default nextConfig;
