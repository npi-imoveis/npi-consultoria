// app/api/get-slug-by-id/[id]/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Conexão com o banco de dados real (exemplo com Prisma)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Cache simples em memória (opcional para performance)
const cache = new Map();

export async function GET(request, { params }) {
  const { id } = params;
  
  // Headers úteis para logging e segurança
  const headersList = headers();
  const referer = headersList.get('referer') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  console.log(`Buscando slug para imóvel ${id}. Origem: ${referer}`);

  try {
    // Verifica cache primeiro (opcional)
    if (cache.has(id)) {
      console.log(`Retornando do cache para ID ${id}`);
      return NextResponse.json(cache.get(id));
    }

    // Busca no banco de dados
    const imovel = await prisma.imovel.findUnique({
      where: { id: parseInt(id) },
      select: { slug: true }
    });

    if (!imovel || !imovel.slug) {
      console.warn(`Imóvel ${id} não encontrado`);
      return NextResponse.json(
        { error: 'Imóvel não encontrado' },
        { status: 404 }
      );
    }

    // Formata resposta
    const responseData = {
      id,
      slug: imovel.slug,
      _meta: {
        cached: false,
        timestamp: new Date().toISOString()
      }
    };

    // Atualiza cache (opcional)
    cache.set(id, responseData);
    setTimeout(() => cache.delete(id), 60_000); // Expira em 1 minuto

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60', // Cache de 60s no edge
        'CDN-Cache-Control': 'public, s-maxage=60'
      }
    });

  } catch (error) {
    console.error(`Erro ao buscar imóvel ${id}:`, error.message);
    
    return NextResponse.json(
      { 
        error: 'Erro interno no servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { 
        status: 500,
        headers: {
          'Retry-After': '10' // Sugere tentar novamente após 10s
        }
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Configuração opcional para Edge Runtime (melhor performance)
export const runtime = 'edge'; 
export const dynamic = 'force-dynamic'; // Garante que cada request é processada individualmente
