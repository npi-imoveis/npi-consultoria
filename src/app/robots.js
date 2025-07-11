/**
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/imovel-*/facebook.com/',
          '/imovel-*/instagram.com/',
          '/imovel-*/linkedin.com/',
          '/imovel-*/twitter.com/',
          '/imovel-*/youtube.com/'
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
