// app/sitemap.xml/route.ts
import { MetadataRoute } from 'next';

export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'; // Valor padrão como fallback

        // 1. Busque os slugs dinâmicos (do banco de dados, CMS, etc.)
        const dynamicPages = await fetchDynamicPages() || []; // Garantir que seja um array

        // 2. Gere as entradas do sitemap para páginas genéricas
        const sitemapEntries = dynamicPages.map((page) => ({
            url: `${baseUrl}/${page.slug}`,
            lastModified: new Date(page.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        // Gere entradas específicas para páginas de imóveis
        const sitemapImoveis = dynamicPages.map((page) => ({
            url: `${baseUrl}/imovel-${page.codigo}/${page.slug}`,
            lastModified: new Date(page.updatedAt),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));

        // 3. Adicione URLs estáticas (opcional)
        const staticUrls = [
            { url: baseUrl, priority: 1.0 },
            { url: `${baseUrl}/sobre/hub-imobiliarias`, priority: 0.8 },
            { url: `${baseUrl}/sobre/npi-imoveis`, priority: 0.8 },
            { url: `${baseUrl}/venda-seu-imovel`, priority: 0.8 },
        ];

        const sitemap = [...staticUrls, ...sitemapImoveis, ...sitemapEntries];

        // 4. Retorne o XML formatado
        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${sitemap.map((entry) => `
            <url>
              <loc>${entry.url}</loc>
              ${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ''}
              ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
              ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
            </url>
          `).join('')}
        </urlset>`,
            {
                headers: {
                    'Content-Type': 'application/xml',
                },
            }
        );
    } catch (error) {
        console.error('Erro ao gerar sitemap:', error);

        // Em caso de erro, retorne um sitemap básico com as URLs estáticas apenas
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';
        const staticUrls = [
            { url: baseUrl, priority: 1.0 },
            { url: `${baseUrl}/sobre/hub-imobiliarias`, priority: 0.8 },
            { url: `${baseUrl}/sobre/npi-imoveis`, priority: 0.8 },
            { url: `${baseUrl}/venda-seu-imovel`, priority: 0.8 },
        ];

        return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${staticUrls.map((entry) => `
            <url>
              <loc>${entry.url}</loc>
              ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
            </url>
          `).join('')}
        </urlset>`,
            {
                headers: {
                    'Content-Type': 'application/xml',
                },
            }
        );
    }
}


async function fetchDynamicPages() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'

    try {
        const res = await fetch(`${baseUrl}/api/imoveis/slug`);

        if (!res.ok) {
            console.error('Falha ao buscar slugs:', res.status);
            return []; // Retorna array vazio em caso de erro para evitar quebra do site
        }

        const data = await res.json();

        // Verifica se a resposta tem o formato esperado
        if (!data || !data.data) {
            console.error('Formato de resposta inválido:', data);
            return [];
        }

        // Retorna os dados já formatados com codigo e slug
        return data.data.map(item => ({
            codigo: item.Codigo,
            slug: item.Slug,
            updatedAt: new Date().toISOString() // Como não temos a data de atualização, usamos a data atual
        }));
    } catch (error) {
        console.error('Erro ao buscar páginas dinâmicas:', error);
        return []; // Retorna array vazio em caso de erro para evitar quebra do site
    }
}
