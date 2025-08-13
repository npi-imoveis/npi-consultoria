export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';

        // 1. Busque os slugs dinâmicos (do banco de dados, CMS, etc.)
        const dynamicPages = await fetchDynamicPages() || [];

        // 2. URLs estáticas com prioridades ESTRATÉGICAS
        const staticUrls = [
            { 
                url: baseUrl, 
                priority: 1.0, 
                changeFrequency: 'weekly',
                lastModified: new Date()
            },
            { 
                url: `${baseUrl}/sobre/hub-imobiliarias`, 
                priority: 0.8, 
                changeFrequency: 'weekly',
                lastModified: new Date()
            },
            { 
                url: `${baseUrl}/sobre/npi-imoveis`, 
                priority: 0.8, 
                changeFrequency: 'weekly',
                lastModified: new Date()
            },
            { 
                url: `${baseUrl}/venda-seu-imovel`, 
                priority: 0.8, 
                changeFrequency: 'weekly',
                lastModified: new Date()
            },
        ];

        // 3. URLs de IMÓVEIS com PRIORIDADE MÁXIMA (core business)
        const sitemapImoveis = dynamicPages.map((page) => ({
            url: `${baseUrl}/imovel-${page.codigo}/${page.slug}`,
            lastModified: new Date(page.updatedAt),
            changeFrequency: 'daily', // Imóveis mudam status/preço frequentemente
            priority: 0.9, // PRIORIDADE ALTA - core business
        }));

        // 4. URLs genéricas com prioridade menor
        const sitemapEntries = dynamicPages.map((page) => ({
            url: `${baseUrl}/${page.slug}`,
            lastModified: new Date(page.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.6, // Prioridade menor para URLs genéricas
        }));

        // 5. Combinar tudo com ORDEM ESTRATÉGICA (mais importantes primeiro)
        const sitemap = [...staticUrls, ...sitemapImoveis, ...sitemapEntries];

        // 6. Retorne o XML OTIMIZADO
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${sitemap.map((entry) => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`,
            {
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
                },
            }
        );
    } catch (error) {
        console.error('Erro ao gerar sitemap:', error);

        // FALLBACK otimizado com prioridades corretas
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';
        const staticUrls = [
            { url: baseUrl, priority: 1.0, changeFrequency: 'weekly' },
            { url: `${baseUrl}/sobre/hub-imobiliarias`, priority: 0.8, changeFrequency: 'weekly' },
            { url: `${baseUrl}/sobre/npi-imoveis`, priority: 0.8, changeFrequency: 'weekly' },
            { url: `${baseUrl}/venda-seu-imovel`, priority: 0.8, changeFrequency: 'weekly' },
        ];

        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((entry) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`,
            {
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, max-age=3600',
                },
            }
        );
    }
}

async function fetchDynamicPages() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'

    try {
        const res = await fetch(`${baseUrl}/api/imoveis/slug`, {
            // Adicionar cache busting para dados mais frescos
            headers: {
                'Cache-Control': 'no-cache',
            },
        });

        if (!res.ok) {
            console.error('Falha ao buscar slugs:', res.status);
            return [];
        }

        const data = await res.json();

        if (!data || !data.data) {
            console.error('Formato de resposta inválido:', data);
            return [];
        }

        // Retorna os dados otimizados com lastModified atual
        return data.data.map(item => ({
            codigo: item.Codigo,
            slug: item.Slug,
            updatedAt: new Date().toISOString() // Data atual para forçar refresh
        }));
    } catch (error) {
        console.error('Erro ao buscar páginas dinâmicas:', error);
        return [];
    }
}
