/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // ✅ MANTIDO: Sua configuração atual
  
  // ✅ MANTIDO + EXPANDIDO: Experimentais otimizadas
  experimental: {
    optimizePackageImports: ['lucide-react'], // 🚀 Tree shaking icons (mantido)
    optimizeCss: true, // ✅ ADICIONADO: Otimiza CSS (pode ajudar com os 10 KiB CSS unused)
  },
  
  // ✅ MANTIDO + OTIMIZADO: Configuração de imagens (exatamente igual + pequenos ajustes)
  images: {
    // ✅ MANTIDO: Todos os remotePatterns existentes (zero mudanças)
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
    
    // ✅ MANTIDO + PEQUENO AJUSTE: Para resolver os 41 KiB de imagens restantes
    formats: ["image/avif", "image/webp"], // Mantido
    deviceSizes: [640, 750, 828, 1080, 1200], // Mantido
    minimumCacheTTL: 60, // Cache de 60 segundos (mantido)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Mantido
    dangerouslyAllowSVG: true, // Mantido
    contentDispositionType: 'attachment', // Mantido
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // Mantido
    
    // ✅ ADICIONADO: Qualidade ligeiramente reduzida para economizar bytes
    quality: 70, // Novo: era padrão 75, agora 70 (economiza bytes nas imagens)
  },
  
  // ✅ MANTIDO: TypeScript config
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Mantido (sua configuração atual)
  },

  // ✅ MANTIDO: Compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.log em produção
  },
  swcMinify: true, // Minificação otimizada

  // 🚀 WEBPACK CIRÚRGICO: FOCO APENAS nos 7 polyfills detectados no PageSpeed
  webpack: (config, { dev, isServer }) => {
    // ✅ MANTIDO: Sua configuração webpack existente
    if (!dev && !isServer) {
      // ✅ MANTIDO: Configurações existentes
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // ✅ MANTIDO: Otimizações existentes
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
      
      // 🎯 ADIÇÃO CIRÚRGICA: APENAS os polyfills específicos detectados no PageSpeed
      config.resolve.alias = {
        ...config.resolve.alias,
        
        // ⚡ FOCO CIRÚRGICO: APENAS os 7 polyfills confirmados no relatório PageSpeed
        'core-js/modules/es.array.at': false,                // ✅ Detectado: Array.prototype.at
        'core-js/modules/es.object.has-own': false,           // ✅ Detectado: Object.hasOwn
        'core-js/modules/es.array.flat': false,               // ✅ Detectado: Array.prototype.flat
        'core-js/modules/es.array.flat-map': false,           // ✅ Detectado: Array.prototype.flatMap
        'core-js/modules/es.object.from-entries': false,      // ✅ Detectado: Object.fromEntries
        'core-js/modules/es.string.trim-end': false,          // ✅ Detectado: String.prototype.trimEnd
        'core-js/modules/es.string.trim-start': false,        // ✅ Detectado: String.prototype.trimStart
      };
      
      // 🎯 TARGET MODERNO: Apenas para remover polyfills (cuidadosamente)
      if (config.target) {
        config.target = ['web', 'es2022']; // Browsers que suportam Array.at (2022+)
      }
    }
    
    return config; // ✅ MANTIDO: Return padrão
  },

  // ✅ MANTIDO: Headers de cache (exatamente iguais)
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
  
  // ✅ MANTIDO: Redirects existentes (exatamente iguais)
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
