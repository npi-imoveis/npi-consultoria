import { NextResponse } from 'next/server';

// Configuração otimizada para Vercel
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hora

export async function GET(_, { params }) {
  const { id } = params;

  try {
    // Substitua por sua consulta real ao banco de dados
    const imovel = await findImovelById(id); // Sua função de busca
    
    if (!imovel?.slug) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: getCacheHeaders(60) }
      );
    }

    return NextResponse.json(
      { id, slug: imovel.slug },
      { headers: getCacheHeaders(3600) }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500, headers: getCacheHeaders(10) }
    );
  }
}

// Helper para headers de cache
function getCacheHeaders(seconds) {
  return {
    'Cache-Control': `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`,
    'CDN-Cache-Control': `public, max-age=${seconds}`
  };
}

// Mock - substitua pela sua busca real (Prisma/MySQL/etc)
async function findImovelById(id) {
  // Exemplo com dados fixos - na prática, consulte seu banco
  const mockData = {
    '9507': { slug: 'avenida-antonio-joaquim-de-moura-andrade-597' },
    '80867': { slug: 'edificio-searpa' }
  };
  return mockData[id] || null;
}
