/**
 * @returns {import('next').MetadataRoute.Sitemap}
 */
export default function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Rotas estáticas principais
    const routes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/sobre`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contato`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/busca`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/venda-seu-imovel`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // Aqui você pode adicionar lógica para incluir páginas dinâmicas como imóveis
    // Exemplo: Se tiver uma API que retorna todos os imóveis
    // const properties = await fetchProperties();
    // const propertyRoutes = properties.map(property => ({
    //   url: `${baseUrl}/imovel-${property.id}`,
    //   lastModified: new Date(property.updatedAt),
    //   changeFrequency: 'weekly',
    //   priority: 0.7,
    // }));
    // 
    // return [...routes, ...propertyRoutes];

    return routes;
} 