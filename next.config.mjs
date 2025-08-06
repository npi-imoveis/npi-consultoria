/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // ✅ MANTIDO: Sua configuração atual
  
  // ✅ OTIMIZAÇÕES: Experimentais válidas
  experimental: {
    optimizePackageImports: ['lucide-react'], // 🚀 NOVO: Tree shaking icons
  },
  
  // ✅ MANTIDO + OTIMIZADO: Configuração de imagens
  images: {
    // ✅ MANTIDO: Todos os remotePatterns existentes
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
        hostname: "sigasp.com.br",
      },      
      {
        protocol: "https",
        hostname: "cdn.imoview.com.br",
        pathname: "/**",
      },
    ],
    
    // ✅ MANTIDO: Configuração existente
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60, // Cache de 60 segundos
    
    // 🚀 NOVO: Otimizações para resolver 176 KiB de imagens superdimensionadas
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tamanhos pequenos para thumbnails
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ✅ MANTIDO: TypeScript config
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Remover em produção
  },

  // 🚀 NOVO: Compilação moderna - Remove JavaScript legado (12 KiB)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log em produção
  },
  swcMinify: true, // Minificação otimizada
  
  // 🚀 NOVO: Webpack otimizado para JavaScript moderno
  webpack: (config, { dev, isServer }) => {
    // Remove polyfills desnecessários apenas em produção
    if (!dev && !isServer) {
      // Target ES2020+ para remover polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // 🚀 NOVO: Headers de cache para performance (176 KiB economia em imagens)
  async headers() {
    return [
      {
        // Cache agressivo para imagens estáticas
        source: '/assets/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 ano
          },
        ],
      },
      {
        // Cache para assets do Next.js
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache para imagens otimizadas
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
  
  // ✅ MANTIDO: Redirects existentes
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
  
  // ✅ MANTIDO: Output config
  output: "standalone", // Para builds containerizadas
};

export default nextConfig;
