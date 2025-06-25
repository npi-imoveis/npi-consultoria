// src/app/busca/[...slug]/page.js
import { notFound } from 'next/navigation';

export default function DynamicSearchPage({ params, searchParams }) {
  // Debug: Verifique os parâmetros recebidos
  console.log('Params:', params);
  console.log('SearchParams:', searchParams);

  // Validação do slug
  if (!params.slug || !Array.isArray(params.slug)) {
    return notFound();
  }

  const slugPath = params.slug.join('/');
  const searchTerm = searchParams?.q || slugPath; // Usa o slug se não houver termo

  // Simulação de dados REAIS (substitua por sua API)
  const mockResults = [
    { id: 1, title: `Apartamento em ${slugPath.split('/').pop()}`, price: 'R$ 450.000' },
    { id: 2, title: `Cobertura à venda - ${slugPath.split('/').pop()}`, price: 'R$ 620.000' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cabeçalho com termo real */}
      <h1 className="text-3xl font-bold mb-6">
        {searchTerm ? `Resultados para: "${searchTerm}"` : 'Imóveis disponíveis'}
      </h1>

      {/* Filtros ativos */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Filtros aplicados:</h2>
        <div className="flex flex-wrap gap-2">
          {params.slug.map((segment, index) => (
            <span key={index} className="bg-white px-3 py-1 rounded-full text-sm shadow">
              {segment}
            </span>
          ))}
        </div>
      </div>

      {/* Resultados REAIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockResults.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-blue-600 font-medium">{item.price}</p>
            <p className="text-gray-500 text-sm">Código: {item.id}</p>
          </div>
        ))}
      </div>

      {/* Debug UI (opcional) */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
        <h3 className="font-bold mb-2">Debug:</h3>
        <pre>{JSON.stringify({ params, searchParams }, null, 2)}</pre>
      </div>
    </div>
  );
}
