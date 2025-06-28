// middleware.js
import { NextResponse } from 'next/server'

// Banco de dados TEMPORÁRIO (substitua por API/Database depois)
const SLUGS_POR_ID = {
  "9507": "avenida-antonio-joaquim-de-moura-andrade-597", 
  // Adicione TODOS os outros imóveis aqui:
  "1234": "exemplo-de-slug",
  "5678": "outro-imovel-slug"
}

export async function middleware(request) {
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Captura /imovel-QUALQUER-NÚMERO (sem slug)
  const match = path.match(/^\/imovel-(\d+)$/)
  if (match) {
    const id = match[1]
    const slugCorreto = await getSlugPorId(id) // Função modificada
    
    if (slugCorreto) {
      url.pathname = `/imovel-${id}/${slugCorreto}`
      return NextResponse.redirect(url, 301)
    }
  }

  return NextResponse.next()
}

// Função melhorada para buscar slugs (simule sua API aqui)
async function getSlugPorId(id) {
  // 1. Primeiro tenta no objeto estático
  if (SLUGS_POR_ID[id]) return SLUGS_POR_ID[id]
  
  // 2. Se não encontrar, busca na API (descomente depois)
  // const res = await fetch(`https://sua-api.com/imoveis/${id}/slug`)
  // if (res.ok) return (await res.json()).slug
  
  return null // Caso não encontre
}

export const config = {
  matcher: '/imovel-:id(\d+)' // Captura TODOS os IDs numéricos
}
