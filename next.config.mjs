/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // Volta para o padrão - middleware gerencia tudo
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.npiconsultoria.com.br', // Permite todos subdomínios
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
    // Configuração importante para otimização
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60, // Cache de 60 segundos
  },
  typescript: {
    ignoreBuildErrors: true, // Apenas para desenvolvimento
  },
  async redirects() {
    return [
      // Redirects de condominios (slugs antigos para novos)

       {
        source: "/avenida-jamaris-603",
        destination: "/edificio-michelangelo",
        permanent: true
      },
      {
        source: "/east-blue",
        destination: "/east-blue-residences-tatuape",
        permanent: true
      },
      {
        source: "/casas-em-condominio-gramado",
        destination: "/casa-punta-gramado-rs",
        permanent: true
      },
       {
        source: "/e-side-vila-madalena-rua-girassol1280",
        destination: "/e-side-vila-madalena",
        permanent: true
      },
      {
        source: "/edificio-itanhanga-santana",
        destination: "/condominio-itanhanga",
        permanent: true
      },
      {
        source: "/residencial-azul",
        destination: "/azul-idea-zarvos",
        permanent: true
      },
      {
        source: "/the-frame-vila-nova",
        destination: "/the-frame-vila-nova-conceicao",
        permanent: true
      },
      {
        source: "/ibi-ara",
        destination: "/condominio-ibi-aram",
        permanent: true
      },
      {
        source: "/residencial-jequitibas",
        destination: "/condominio-portal-do-jequitiba-valinhos",
        permanent: true
      },
      {
        source: "/condominio-campo-de-toscana-vinhedo-enderecobarao-de-iguatemi",
        destination: "/residencial-campo-de-toscana-vinhedo",
        permanent: true
      },
      {
        source: "/barao-de-iguatemi",
        destination: "/edificio-barao-de-iguatemi",
        permanent: true
      },
      {
        source: "/residencial-platinum",
        destination: "/platinum-morumbi",
        permanent: true
      },
      {
        source: "/residencial-malaga",
        destination: "/malaga-analia-franco",
        permanent: true
      },
      {
        source: "/edificio-tiffany",
        destination: "/tiffany-analia-franco",
        permanent: true
      },
      {
        source: "/medplex",
        destination: "/thera-ibirapuera-by-yoo",
        permanent: true
      },
      {
        source: "/residencial-montblanc",
        destination: "/montblanc-tatuape",
        permanent: true
      },
      {
        source: "/empreendimento-praca-henrique-monteiro",
        destination: "/praca-henrique-monteiro",
        permanent: true
      },
      {
        source: "/j-h-s-f-fasano-residences-cidade-jardim",
        destination: "/fasano-cidade-jardim",
        permanent: true
      },
      {
        source: "/rua-sebastiao-cardoso-168",
        destination: "/condominio-santorini-residencial-club",
        permanent: true
      },
      {
        source: "/condominio-residencial-santorini",
        destination: "/condominio-santorini-residencial-club",
        permanent: true
      },
      {
        source: "/rua-verbo-divino-1061",
        destination: "/reserva-granja-julieta",
        permanent: true
      },
      {
        source: "/grand-habitarte-brooklin",
        destination: "/grand-habitarte",
        permanent: true
      },
      {
        source: "/habitarte-2-brooklin",
        destination: "/habitarte-2",
        permanent: true
      },
      {
        source: "/one-sixty-vila-olimpia",
        destination: "/one-sixty",
        permanent: true
      },
      {
        source: "/one-sixty-cyrela-by-yoo",
        destination: "/one-sixty",
        permanent: true
      },
      {
        source: "/acapulco-guaruja-condominio",
        destination: "/condominio-jardim-acapulco",
        permanent: true
      },
      {
        source: "/casa-a-venda-condominio-acapulco",
        destination: "/condominio-jardim-acapulco",
        permanent: true
      },
      {
        source: "/casa-a-venda-jardim-acapulco-guaruja",
        destination: "/condominio-jardim-acapulco",
        permanent: true
      },
      {
        source: "/residencial-acapulco-guaruja",
        destination: "/condominio-jardim-acapulco",
        permanent: true
      }
    ];
  },
  output: "standalone", // Ou 'export' se estiver gerando static sites
};

export default nextConfig;
