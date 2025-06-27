// app/api/get-slug-by-id/[id]/route.js
import { NextResponse } from 'next/server';

// Dados mockados (substitua pela sua conexão real com o banco de dados)
const imoveis = {
  '9507': { slug: 'avenida-antonio-joaquim-de-moura-andrade-597' },
  '80867': { slug: 'edificio-searpa' }
  // Adicione mais imóveis conforme necessário
};

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Verifica se o ID existe nos dados
    if (imoveis[id]) {
      return NextResponse.json({
        success: true,
        id,
        slug: imoveis[id].slug
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600' // Cache de 1 hora
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Imóvel não encontrado'
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro no servidor'
    }, { status: 500 });
  }
}

// Configurações importantes para a Vercel
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
