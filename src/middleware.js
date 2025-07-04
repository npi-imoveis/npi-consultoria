import { NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Imovel from '../../models/Imovel';

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;

  console.log(`Middleware processing: ${pathname}`);

  const imovelPattern = /^\/imovel-(\d+)(?:\/?)$/i;
  const match = pathname.match(imovelPattern);
  
  if (!match) {
    return NextResponse.next();
  }

  const id = match[1];
  console.log(`Processing imovel ID: ${id}`);

  try {
    // Conexão com o banco de dados
    await dbConnect();
    console.log(`Database connected, searching for imovel ${id}`);
    
    // Busca o imóvel no MongoDB
    const imovel = await Imovel.findOne(
      { Codigo: parseInt(id) },
      { Slug: 1, _id: 0 }
    ).lean();

    if (imovel?.Slug) {
      const newUrl = new URL(`/imovel-${id}/${imovel.Slug}`, origin);
      
      // Preserva os parâmetros de query
      searchParams.forEach((value, key) => {
        newUrl.searchParams.append(key, value);
      });
      
      console.log(`Redirecting to: ${newUrl.toString()}`);
      return NextResponse.redirect(newUrl, 301);
    }
  } catch (error) {
    console.error(`Error processing imovel ${id}:`, error);
  }

  // Fallback para página de busca se ocorrer erro ou imóvel não encontrado
  const buscaUrl = new URL('/busca', origin);
  searchParams.forEach((value, key) => {
    buscaUrl.searchParams.append(key, value);
  });
  
  return NextResponse.redirect(buscaUrl, 302);
}

// Configuração do middleware
export const config = {
  // Força execução no Node.js Runtime (necessário para Mongoose)
  runtime: 'nodejs',
  
  // Padrões de URL para ativar o middleware
  matcher: [
    '/imovel-:id(\\d+)',
    '/imovel-:id(\\d+)/',
  ],
};
