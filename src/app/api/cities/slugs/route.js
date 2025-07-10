// src/app/api/cities/slugs/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import City from '@/app/models/City';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get slug mapping for active cities
    const slugMapping = await City.getSlugMapping();
    
    return NextResponse.json({
      status: 200,
      data: slugMapping
    });
    
  } catch (error) {
    console.error('Erro ao buscar mapeamento de slugs:', error);
    return NextResponse.json({
      status: 500,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
}