// src/app/api/get-slug/[id]/route.js

import { NextResponse } from 'next/server';
// Importe a mesma função de serviço que a sua página de imóvel usa
import { getImovelById } from '@/app/services'; // ⬅️ Verifique se este caminho está correto!

export async function GET(request, { params }) {
  const { id } = params; // No App Router, o ID vem de params para rotas dinâmicas

  // Log 1: Confirma que a API foi chamada e qual ID ela recebeu.
  console.log(`[API get-slug (App Router)] Requisição GET recebida para o ID: ${id}`);

  if (!id) {
    console.log('[API get-slug (App Router)] Erro: ID do imóvel é obrigatório.');
    // No App Router, você retorna NextResponse.json
    return NextResponse.json({ error: 'ID do imóvel é obrigatório.' }, { status: 400 });
  }

  try {
    // Log 2: Informa que estamos prestes a chamar a função de busca.
    console.log(`[API get-slug (App Router)] Chamando getImovelById para o ID: ${id}`);
    
    // Utilize a função que JÁ FUNCIONA para buscar o imóvel
    const response = await getImovelById(id);

    // Log 3: O LOG MAIS IMPORTANTE! O que a função getImovelById retornou?
    // Usamos JSON.stringify para garantir que vejamos a estrutura completa do objeto.
    console.log(`[API get-slug (App Router)] Retorno de getImovelById:`, JSON.stringify(response, null, 2));

    // A condição que está causando o 404. Vamos ver o porquê.
    if (!response?.data || !response.data.Slug) {
      // Log 4: Detalhes do erro 404. O que está nulo ou indefinido?
      console.log(`[API get-slug (App Router)] Disparando Erro 404. Motivo:`);
      console.log(`[API get-slug (App Router)] Valor de response?.data:`, response?.data);
      console.log(`[API get-slug (App Router)] Valor de response.data.Slug:`, response?.data?.Slug);
      
      return NextResponse.json({ error: 'Imóvel não encontrado ou sem slug.' }, { status: 404 });
    }

    const slug = response.data.Slug;

    // Log 5: Se tudo der certo, veremos esta mensagem.
    console.log(`[API get-slug (App Router)] Sucesso! Retornando slug para o ID ${id}: ${slug}`);

    // Retorna o slug com sucesso
    return NextResponse.json({ slug }, { status: 200 });

  } catch (error) {
    // Log 6: Captura qualquer erro inesperado durante o processo.
    console.error(`[API get-slug (App Router)] CATCH: Erro inesperado ao processar a API para o ID ${id}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor ao buscar o slug.' }, { status: 500 });
  }
}
