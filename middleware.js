// middleware.js
import { NextResponse } from "next/server";

// Dados FIXOS (substitua pelos seus IDs e slugs reais)
const slugsPorId = {
  "9507": "avenida-antonio-joaquim-de-moura-andrade-597",
  // Adicione outros imóveis aqui no formato "ID": "slug-correto"
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Redireciona /imovel-9507 → /imovel-9507/slug-correto
  if (pathname.match(/^\/imovel-(\d+)$/)) {
    const id = pathname.match(/^\/imovel-(\d+)$/)[1];
    const slugCorreto = slugsPorId[id];
    
    if (slugCorreto) {
      return NextResponse.redirect(
        new URL(`/imovel-${id}/${slugCorreto}`, request.url),
        301 // Redirecionamento permanente para SEO
      );
    }
  }

  // 2. Mantenha suas regras existentes de rewrite/redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id(\d+)",     // Captura /imovel-9507 (apenas números)
    "/imovel-:id/:slug*",    // Suas rotas existentes
    "/imovel/:id/:slug*"
  ]
};
