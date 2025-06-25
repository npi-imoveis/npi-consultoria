// src/app/busca/[...slug]/page.js
import { notFound } from 'next/navigation';

export default function DynamicSearchPage({ params, searchParams }) {
  // Se não houver slug, redireciona para 404
  if (!params.slug || params.slug.length === 0) {
    return notFound();
  }

  // Converte slug para string (ex: "categoria/produto")
  const slugPath = params.slug.join('/');
  
  // Extrai parâmetros de query
  const searchQuery = searchParams?.q || '';
  const currentPage = searchParams?.page || '1';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resultados da Busca</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Parâmetros Capturados:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Caminho (slug):</strong> {slugPath}</li>
          <li><strong>Termo de busca (q):</strong> {searchQuery.toString()}</li>
          <li><strong>Página atual:</strong> {currentPage.toString()}</li>
        </ul>
      </div>

      {/* Exemplo: Simulação de resultados */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg hover:bg-gray-50">
            <h3 className="font-medium text-lg">Resultado {i + 1} para "{searchQuery}"</h3>
            <p className="text-gray-600">Caminho: {slugPath}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Opcional: Geração estática para slugs conhecidos
export async function generateStaticParams() {
  return [
    { slug: ['exemplo'] },
    { slug: ['categoria', 'produto'] }
  ];
}

// Opcional: Metadados dinâmicos
export async function generateMetadata({ params }) {
  const slugPath = params.slug.join('/');
  return {
    title: `Busca: ${slugPath} | NPI Consultoria`,
    description: `Página de resultados para ${slugPath}`
  };
}
