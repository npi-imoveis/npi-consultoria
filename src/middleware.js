import { NextResponse } from 'next/server';
import dbConnect from '../app/lib/dbConnect';  // Caminho corrigido para sua estrutura
import Imovel from '../models/Imovel';        // Caminho corrigido

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;

  // Verifica se a URL corresponde ao padrão /imovel-123
  const imovelPattern = /^\/imovel-(\d+)(?:\/?)$/i;
  const match = pathname.match(imovelPattern);
  
  if (!match) {
    return NextResponse.next(); // Continua a requisição se não for um imóvel
  }

  const id = match[1];

  try {
    // Conexão com o banco de dados
    await dbConnect();
    
    // Busca o imóvel no MongoDB
    const imovel = await Imovel.findOne(
      { Codigo: parseInt(id) },
      { Slug: 1, _id: 0 } // Apenas o campo Slug
    ).lean();

    // Se encontrou o imóvel, redireciona para a URL com slug
    if (imovel?.Slug) {
      const newUrl = new URL(`/imovel-${id}/${imovel.Slug}`, origin);
      
      // Mantém os parâmetros de query (ex: ?ref=123)
      searchParams.forEach((value, key) => {
        newUrl.searchParams.append(key, value);
      });
      
      return NextResponse.redirect(newUrl, 301);
    }
  } catch (error) {
    console.error(`Erro ao processar imóvel ${id}:`, error);
  }

  // Fallback: redireciona para /busca se algo der errado
  const buscaUrl = new URL('/busca', origin);
  searchParams.forEach((value, key) => {
    buscaUrl.searchParams.append(key, value);
  });
  
  return NextResponse.redirect(buscaUrl, 302);
}

// Configuração obrigatória para usar Mongoose
export const config = {
  runtime: 'nodejs', // ❗ Importante: Node.js runtime para MongoDB
  matcher: [
    '/imovel-:id(\\d+)',    // Match /imovel-123
    '/imovel-:id(\\d+)/',   // Match /imovel-123/
  ],
};
