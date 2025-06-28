import { NextResponse } from 'next/server'

// Banco de dados temporário (substitua pela sua API real)
const SLUGS_POR_ID = {
  "9507": "avenida-antonio-joaquim-de-moura-andrade-597",
  "1234": "exemplo-de-slug",
  "5678": "outro-imovel-slug"
}

export async function middleware(request) {
  const url = request.nextUrl.clone()
  const path = url.pathname

  console.log(`Middleware processando: ${path}`) // Log para debug

  // Captura /imovel-9507 (sem slug)
  if (path.match(/^\/imovel-(\d+)$/)) {
    const id = path.split('-')[1]
    const slug = SLUGS_POR_ID[id]

    if (slug) {
      console.log(`Redirecionando /imovel-${id} para /imovel/${slug}`)
      return NextResponse.redirect(
        new URL(`/imovel/${slug}`, request.url),
        301
      )
    } else {
      console.log(`ID ${id} não encontrado - redirecionando para busca`)
      return NextResponse.redirect(new URL('/busca', request.url), 302)
    }
  }

  return NextResponse.next()
}

// Configuração do middleware
export const config = {
  matcher: [
    '/imovel-:id(\d+)', // Captura apenas números após imovel-
    '/imovel-:id/:slug*' // Mantém outras rotas existentes
  ]
}
