import { NextResponse } from 'next/server'

// Banco de dados TEMPORÁRIO - ADICIONE TODOS OS IMÓVEIS AQUI!
const SLUGS_POR_ID = {
  "9507": "avenida-antonio-joaquim-de-moura-andrade-597",
  "1234": "exemplo-de-slug",
  "5678": "outro-imovel-slug"
}

export async function middleware(request) {
  const url = request.nextUrl.clone()
  const path = url.pathname
  
  // Debug (aparece nos logs da Vercel)
  console.log(`[Middleware] Processando rota: ${path}`)

  // 1. Captura /imovel-9507 (sem slug)
  if (path.match(/^\/imovel-(\d+)$/)) {
    const id = path.split('-')[1]
    const slugCorreto = SLUGS_POR_ID[id]

    if (slugCorreto) {
      console.log(`[Middleware] Redirecionando /imovel-${id} para /imovel/${slugCorreto}`)
      return NextResponse.redirect(
        new URL(`/imovel/${slugCorreto}`, request.url),
        301
      )
    }
  }

  return NextResponse.next()
}

// Configuração OBRIGATÓRIA
export const config = {
  matcher: [
    '/imovel-:id(\d+)',  // Captura /imovel-9507
    '/imovel-:id/:slug*'  // Mantém suas rotas existentes
  ]
}
