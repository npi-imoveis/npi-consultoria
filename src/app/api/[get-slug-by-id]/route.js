// app/api/get-slug-by-id/route.js

import { NextResponse } from 'next/server';

// Simulação de banco de dados - substitua pela sua lógica real
const imoveis = {
  '9507': { slug: 'avenida-antonio-joaquim-de-moura-andrade-597' },
  // Adicione outros imóveis conforme necessário
};

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Verifica se o ID existe no "banco de dados"
    if (imoveis[id]) {
      return NextResponse.json({
        id,
        slug: imoveis[id].slug
      });
    } else {
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar imóvel' },
      { status: 500 }
    );
  }
}
