// middleware.js
import { NextResponse } from 'next/server'

// Mapeamento FIXO de IDs para slugs (substitua pelos seus dados)
const SLUGS_POR_ID = {
  "9507": "avenida-antonio-joaquim-de-moura-andrade-597",
  // Adicione outros imóveis aqui: "ID": "slug-correto"
}

export async function middleware(request) {
  const url = request.nextUrl.clone()
  const path = url.pathname

  // 1. Redireciona /imovel-9507 → /imovel-9507/slug-correto
  const matchSemSlug = path.match(/^\/imovel-(\d+)$/)
  if (matchSemSlug) {
    const id = matchSemSlug[1]
    const slugCorreto = SLUGS_POR_ID[id]
    
    if (slugCorreto) {
      url.pathname = `/imovel-${id}/${slugCorreto}`
      return NextResponse.redirect(url, 301)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/imovel-:id(\d+)', // Só números
    '/imovel-:id/:slug*'
  ]
}
