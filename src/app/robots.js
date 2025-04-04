
/**
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/'],
        },
        host: baseUrl,
        sitemap: `${baseUrl}/sitemap.xml`,
    }
} 