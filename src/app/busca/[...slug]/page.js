// src/app/busca/[...slug]/page.js
import { notFound } from 'next/navigation';
import SearchResults from '@/components/SearchResults';
import Breadcrumb from '@/components/Breadcrumb';

export const dynamic = 'force-dynamic'; // Evita cache problemático

async function getRealEstateData(slugPath, searchParams) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.npiconsultoria.com.br';
  
  try {
    const res = await fetch(`${BASE_URL}/api/properties?${new URLSearchParams({
      operation: slugPath.split('/')[0] || 'comprar',
      type: slugPath.split('/')[1] || 'apartamento',
      location: slugPath.split('/')[2] || '',
      ...searchParams
    })}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      next: { tags: ['property-search'] }
    });

    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: true };
  }
}

export default async function DynamicSearchPage({ params, searchParams }) {
  // Validação extrema de segurança
  if (!params?.slug || !Array.isArray(params.slug) || params.slug.some(segment => typeof segment !== 'string')) {
    return notFound();
  }

  const slugPath = params.slug.join('/');
  const { data, error } = await getRealEstateData(slugPath, searchParams);

  // Componente principal com fallbacks
  return (
    <main className="bg-white min-h-screen">
      {/* Cabeçalho otimizado para SEO */}
      <section className="bg-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <Breadcrumb 
            paths={[
              { name: 'Home', url: '/' },
              { name: 'Busca', url: '/busca' },
              ...params.slug.map((segment, i) => ({
                name: segment.charAt(0).toUpperCase() + segment.slice(1),
                url: `/busca/${params.slug.slice(0, i+1).join('/')}`
              }))
            ]} 
          />
          
          <h1 className="text-3xl font-bold mt-4">
            {`${slugPath.split('/')[0] === 'alugar' ? 'Aluguel' : 'Compra'} de 
            ${slugPath.split('/')[1] || 'Imóveis'} em 
            ${slugPath.split('/')[2] ? slugPath.split('/')[2].replace(/-/g, ' ') : 'Bertioga'}`}
          </h1>
        </div>
      </section>

      {/* Container principal com grid responsivo */}
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de filtros */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h2 className="font-bold text-lg mb-4">Filtrar Resultados</h2>
            {/* Componente de filtros aqui */}
          </div>
        </aside>

        {/* Área de resultados */}
        <div className="lg:col-span-3">
          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">Serviço temporariamente indisponível</p>
            </div>
          ) : (
            <SearchResults 
              properties={data?.properties || []} 
              total={data?.total || 0}
              currentPage={parseInt(searchParams?.page) || 1}
            />
          )}

          {/* Fallback visual */}
          {(!data?.properties || data.properties.length === 0) && !error && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500 mt-2">
                {`Tente ajustar os filtros para "${params.slug.join(' ')}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
