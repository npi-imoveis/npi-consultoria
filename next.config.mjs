/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.vistahost.com.br",
      },
    ],
  },

  typescript: {
    // ⚠️ Isso desativa a verificação de tipos durante o build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;