/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.vistahost.com.br"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.vistahost.com.br",
      },
    ],
  },
};

export default nextConfig;
