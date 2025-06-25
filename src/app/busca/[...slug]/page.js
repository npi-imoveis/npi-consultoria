// src/app/busca/[...slug]/page.js
import { notFound } from 'next/navigation';

export default function DynamicSearchPage({ params, searchParams }) {
  // Validação básica do slug
  if (!params?.slug || !Array.isArray(params.slug)) {
    return notFound();
  }

  const slugPath = params.slug.join('/');
  
  // Parâmetros de busca com fallback
  const operation = params.slug[0] || 'comprar';
  const propertyType = params.slug[1] || 'apartamento';
  const location = params.slug[2] || 'bertioga';
  const page = searchParams?.page || 1;
  
  // Dados mockados otimizados
  const mockResults = [
    {
      id: 1,
      title: `${operation === 'alugar' ? 'Aluguel' : 'Compra'} de ${propertyType} em ${location}`,
      price: 'R$ 450.000',
      area: 80,
      bedrooms: 3,
      bathrooms: 2,
      description: `Excelente ${propertyType} para ${operation} em ${location} com vista para o mar.`,
      code: 'ABC123'
    },
    {
      id: 2,
      title: `${operation === 'alugar' ? 'Aluguel' : 'Compra'} de ${propertyType} de luxo em ${location}`,
      price: 'R$ 1.200.000',
      area: 180,
      bedrooms: 4,
      bathrooms: 4,
      description: `Magnífico ${propertyType} para ${operation} na melhor região de ${location}.`,
      code: 'XYZ789'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {operation === 'alugar' ? 'Aluguel' : 'Compra'} de {propertyType} em {location}
      </h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Filtros ativos:</h2>
        <div className="flex flex-wrap gap-2">
          <span className="bg-white px-3 py-1 rounded-full text-sm shadow">
            Operação: {operation}
          </span>
          <span className="bg-white px-3 py-1 rounded-full text-sm shadow">
            Tipo: {propertyType}
          </span>
          <span className="bg-white px-3 py-1 rounded-full text-sm shadow">
            Local: {location}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockResults.map(property => (
          <div key={property.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 mb-4" />
            
            <h3 className="font-bold text-lg mb-2">{property.title}</h3>
            <p className="text-blue-600 font-semibold text-xl mb-2">{property.price}</p>
            
            <div className="flex gap-4 text-sm text-gray-600 mb-3">
              {property.area && <span>{property.area}m²</span>}
              {property.bedrooms > 0 && <span>{property.bedrooms} quartos</span>}
              {property.bathrooms > 0 && <span>{property.bathrooms} banheiros</span>}
            </div>
            
            <p className="text-gray-500 mb-4">{property.description}</p>
            <p className="text-sm text-gray-400">Código: {property.code}</p>
          </div>
        ))}
      </div>
      
      {/* Paginação simples */}
      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3].map(num => (
          <a 
            key={num} 
            href={`?page=${num}`}
            className={`px-4 py-2 border rounded ${
              page == num ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
            }`}
          >
            {num}
          </a>
        ))}
      </div>
    </div>
  );
}
