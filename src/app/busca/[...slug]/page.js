// src/app/busca/[...slug]/page.js
import { notFound } from 'next/navigation';

export default async function DynamicSearchPage({ params, searchParams }) {
  try {
    // Validação dos parâmetros
    if (!params?.slug || !Array.isArray(params.slug)) {
      console.error('Slug inválido:', params.slug);
      return notFound();
    }

    const slugPath = params.slug.join('/');
    const searchTerm = searchParams?.q?.toString() || slugPath;

    // 1. Validação do termo de busca
    if (typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      console.error('Termo de busca inválido');
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-red-600">Por favor, insira um termo de busca válido</h1>
        </div>
      );
    }

    // 2. Chamada API (substitua pela sua implementação real)
    let results = [];
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || '/api'}/busca?` + 
        new URLSearchParams({
          slug: slugPath,
          q: searchTerm,
          page: searchParams?.page?.toString() || '1'
        });

      const response = await fetch(apiUrl, {
        next: { revalidate: 60 } // Cache de 60 segundos (opcional)
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      results = data.results || [];
    } catch (error) {
      console.error('Erro na API:', error);
      // Fallback para dados mockados se a API falhar
      results = [
        { 
          id: 1, 
          title: `Apartamento em ${slugPath.split('/').pop() || 'Bertioga'}`, 
          price: 'R$ 450.000' 
        },
        { 
          id: 2, 
          title: `Cobertura à venda - ${slugPath.split('/').pop() || 'Bertioga'}`, 
          price: 'R$ 620.000' 
        }
      ];
    }

    // 3. Renderização segura
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {searchTerm ? `Resultados para: "${searchTerm}"` : 'Imóveis disponíveis'}
        </h1>

        {/* Filtros ativos */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Filtros aplicados:</h2>
          <div className="flex flex-wrap gap-2">
            {params.slug.map((segment, index) => (
              <span 
                key={`${segment}-${index}`} 
                className="bg-white px-3 py-1 rounded-full text-sm shadow"
              >
                {segment}
              </span>
            ))}
          </div>
        </div>

        {/* Resultados */}
        {results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <div 
                key={`result-${item.id}`} 
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-blue-600 font-medium">{item.price}</p>
                <p className="text-gray-500 text-sm">Código: {item.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Nenhum imóvel encontrado</p>
          </div>
        )}

        {/* Debug apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
            <h3 className="font-bold mb-2">Debug:</h3>
            <pre>{JSON.stringify(
              { 
                params, 
                searchParams, 
                apiRequest: {
                  slug: slugPath,
                  searchTerm,
                  page: searchParams?.page || '1'
                }
              }, 
              null, 
              2
            )}</pre>
          </div>
        )}
      </div>
    );

  } catch (error) {
    console.error('Erro crítico:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600">Ocorreu um erro</h1>
        <p className="text-gray-600">Por favor, tente novamente mais tarde</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 p-2 bg-red-50 text-red-800 text-sm">
            {error.message}
          </pre>
        )}
      </div>
    );
  }
}
