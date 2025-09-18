// =====================================
// 1. MODELO PROPERTY (MongoDB/Mongoose)
// =====================================
// models/Property.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProperty extends Document {
  // Identificação
  codigo?: string;
  referencia?: string;
  
  // Tipo de transação
  transactionType?: 'venda' | 'locacao' | 'venda_e_locacao';
  forSale?: boolean;
  forRent?: boolean;
  
  // Tipo de imóvel
  propertyType: string;
  categoria?: string;
  
  // Localização
  cidade: string;
  estado: string;
  bairro?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    cep?: string;
  };
  
  // Coordenadas
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  
  // Preços
  precoVenda?: number;
  precoLocacao?: number;
  precoCondominio?: number;
  iptu?: number;
  
  // Características
  area?: number;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  suites?: number;
  
  // Status
  status: 'active' | 'inactive' | 'sold' | 'rented';
  published: boolean;
  destaque?: boolean;
  
  // Mídia
  imagens?: string[];
  imagemPrincipal?: string;
  video?: string;
  tourVirtual?: string;
  
  // Descrição
  titulo?: string;
  descricao?: string;
  
  // Amenidades
  amenidades?: string[];
  
  // Metadados
  createdAt?: Date;
  updatedAt?: Date;
  views?: number;
}

const PropertySchema = new Schema<IProperty>({
  codigo: { type: String, unique: true, sparse: true },
  referencia: { type: String },
  
  transactionType: { 
    type: String, 
    enum: ['venda', 'locacao', 'venda_e_locacao'],
    index: true 
  },
  forSale: { type: Boolean, default: false, index: true },
  forRent: { type: Boolean, default: false, index: true },
  
  propertyType: { type: String, required: true, index: true },
  categoria: { type: String, index: true },
  
  cidade: { type: String, required: true, index: true },
  estado: { type: String, required: true, index: true },
  bairro: { type: String, index: true },
  endereco: {
    logradouro: String,
    numero: String,
    complemento: String,
    cep: String
  },
  
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  
  precoVenda: { type: Number, index: true },
  precoLocacao: { type: Number, index: true },
  precoCondominio: Number,
  iptu: Number,
  
  area: { type: Number, index: true },
  quartos: { type: Number, index: true },
  banheiros: { type: Number, index: true },
  vagas: { type: Number, index: true },
  suites: Number,
  
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'sold', 'rented'],
    default: 'active',
    index: true
  },
  published: { type: Boolean, default: true, index: true },
  destaque: { type: Boolean, default: false },
  
  imagens: [String],
  imagemPrincipal: String,
  video: String,
  tourVirtual: String,
  
  titulo: String,
  descricao: String,
  
  amenidades: [String],
  
  views: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'properties'
});

// Índices compostos
PropertySchema.index({ status: 1, published: 1, transactionType: 1 });
PropertySchema.index({ cidade: 1, propertyType: 1, status: 1 });
PropertySchema.index({ precoVenda: 1, precoLocacao: 1 });

export const Property: Model<IProperty> = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

// =====================================
// 2. CONEXÃO MONGODB
// =====================================
// lib/mongodb.ts

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Por favor, defina MONGODB_URI no .env.local');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached;
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// =====================================
// 3. API ROUTE - BUSCAR IMÓVEIS
// =====================================
// app/api/properties/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Property } from '@/models/Property';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    console.log('🔍 Filtros recebidos:', JSON.stringify(body, null, 2));
    
    // Construir query MongoDB
    const query: any = {
      status: 'active',
      published: true
    };
    
    // FILTRO DE FINALIDADE (CRÍTICO)
    if (body.finalidade) {
      const finalidadeNormalizada = body.finalidade.toLowerCase();
      
      if (finalidadeNormalizada === 'comprar' || finalidadeNormalizada === 'venda') {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { transactionType: { $in: ['venda', 'venda_e_locacao'] } },
            { forSale: true },
            { tipo_transacao: 'venda' },
            { dealType: 'sale' }
          ]
        });
        // Garantir que tenha preço de venda
        query.precoVenda = { $exists: true, $gt: 0 };
        
      } else if (finalidadeNormalizada === 'alugar' || finalidadeNormalizada === 'locacao') {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { transactionType: { $in: ['locacao', 'venda_e_locacao'] } },
            { forRent: true },
            { tipo_transacao: { $in: ['aluguel', 'locacao'] } },
            { dealType: 'rent' }
          ]
        });
        // Garantir que tenha preço de locação
        query.precoLocacao = { $exists: true, $gt: 0 };
      }
    }
    
    // Filtro de tipo de imóvel
    if (body.categoriaSelecionada) {
      const tipoNormalizado = body.categoriaSelecionada.toLowerCase();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { propertyType: new RegExp(body.categoriaSelecionada, 'i') },
          { categoria: new RegExp(body.categoriaSelecionada, 'i') },
          { tipo: new RegExp(body.categoriaSelecionada, 'i') }
        ]
      });
    }
    
    // Filtro de cidade
    if (body.cidadeSelecionada) {
      query.cidade = new RegExp(`^${body.cidadeSelecionada}$`, 'i');
    }
    
    // Filtro de bairros
    if (body.bairrosSelecionados && body.bairrosSelecionados.length > 0) {
      query.bairro = { 
        $in: body.bairrosSelecionados.map(b => new RegExp(b, 'i'))
      };
    }
    
    // Filtros de preço baseados na finalidade
    const finalidade = body.finalidade?.toLowerCase();
    
    if (finalidade === 'alugar' || finalidade === 'locacao') {
      if (body.precoMin) {
        query.precoLocacao = { 
          ...query.precoLocacao, 
          $gte: Number(body.precoMin) 
        };
      }
      if (body.precoMax) {
        query.precoLocacao = { 
          ...query.precoLocacao, 
          $lte: Number(body.precoMax) 
        };
      }
    } else if (finalidade === 'comprar' || finalidade === 'venda') {
      if (body.precoMin) {
        query.precoVenda = { 
          ...query.precoVenda, 
          $gte: Number(body.precoMin) 
        };
      }
      if (body.precoMax) {
        query.precoVenda = { 
          ...query.precoVenda, 
          $lte: Number(body.precoMax) 
        };
      }
    }
    
    // Filtros de área
    if (body.areaMin && Number(body.areaMin) > 0) {
      query.area = { ...query.area, $gte: Number(body.areaMin) };
    }
    if (body.areaMax && Number(body.areaMax) > 0) {
      query.area = { ...query.area, $lte: Number(body.areaMax) };
    }
    
    // Filtros de características
    if (body.quartos) {
      const quartos = body.quartos === '4+' ? 4 : Number(body.quartos);
      if (body.quartos === '4+') {
        query.quartos = { $gte: quartos };
      } else {
        query.quartos = quartos;
      }
    }
    
    if (body.banheiros) {
      const banheiros = body.banheiros === '4+' ? 4 : Number(body.banheiros);
      if (body.banheiros === '4+') {
        query.banheiros = { $gte: banheiros };
      } else {
        query.banheiros = banheiros;
      }
    }
    
    if (body.vagas) {
      const vagas = body.vagas === '4+' ? 4 : Number(body.vagas);
      if (body.vagas === '4+') {
        query.vagas = { $gte: vagas };
      } else {
        query.vagas = vagas;
      }
    }
    
    console.log('📊 Query MongoDB:', JSON.stringify(query, null, 2));
    
    // Executar busca
    const properties = await Property.find(query)
      .select('-__v')
      .sort({ destaque: -1, createdAt: -1 })
      .limit(100)
      .lean();
    
    console.log(`✅ ${properties.length} imóveis encontrados`);
    
    // Formatar resposta
    const formattedProperties = properties.map(prop => {
      const isRent = finalidade === 'alugar' || finalidade === 'locacao';
      const price = isRent ? prop.precoLocacao : prop.precoVenda;
      
      return {
        id: prop._id.toString(),
        codigo: prop.codigo || `PROP-${prop._id.toString().slice(-6)}`,
        titulo: prop.titulo || `${prop.propertyType} em ${prop.bairro || prop.cidade}`,
        tipo: prop.propertyType,
        categoria: prop.categoria,
        transactionType: prop.transactionType,
        forSale: prop.forSale,
        forRent: prop.forRent,
        cidade: prop.cidade,
        estado: prop.estado,
        bairro: prop.bairro,
        endereco: prop.endereco,
        preco: price || 0,
        precoVenda: prop.precoVenda,
        precoLocacao: prop.precoLocacao,
        precoCondominio: prop.precoCondominio,
        iptu: prop.iptu,
        area: prop.area || 0,
        quartos: prop.quartos || 0,
        banheiros: prop.banheiros || 0,
        vagas: prop.vagas || 0,
        imagemPrincipal: prop.imagemPrincipal || '/placeholder.jpg',
        imagens: prop.imagens || [],
        coordinates: prop.location?.coordinates ? {
          lat: prop.location.coordinates[1],
          lng: prop.location.coordinates[0]
        } : null
      };
    });
    
    return NextResponse.json({
      success: true,
      count: formattedProperties.length,
      data: formattedProperties,
      filters: body,
      query: process.env.NODE_ENV === 'development' ? query : undefined
    });
    
  } catch (error) {
    console.error('❌ Erro na busca:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar imóveis',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// GET method para testes
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to search properties',
    example: {
      finalidade: 'Alugar',
      cidadeSelecionada: 'São Paulo',
      categoriaSelecionada: 'Apartamento'
    }
  });
}

// =====================================
// 4. API ROUTE - FILTROS DINÂMICOS
// =====================================
// app/api/properties/filters/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Property } from '@/models/Property';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    let result: any = {};
    
    switch(type) {
      case 'Categoria':
        const categorias = await Property.distinct('propertyType', {
          status: 'active',
          published: true
        });
        result = { data: categorias.filter(Boolean).sort() };
        break;
        
      case 'Cidade':
        const cidades = await Property.distinct('cidade', {
          status: 'active',
          published: true
        });
        result = { data: cidades.filter(Boolean).sort() };
        break;
        
      default:
        result = { data: [] };
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Erro ao buscar filtros:', error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}

// =====================================
// 5. API ROUTE - BAIRROS POR CIDADE
// =====================================
// app/api/properties/bairros/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Property } from '@/models/Property';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const cidade = searchParams.get('cidade');
    const categoria = searchParams.get('categoria');
    
    if (!cidade) {
      return NextResponse.json({ data: [] });
    }
    
    const query: any = {
      status: 'active',
      published: true,
      cidade: new RegExp(`^${cidade}$`, 'i')
    };
    
    if (categoria) {
      query.propertyType = new RegExp(categoria, 'i');
    }
    
    const bairros = await Property.distinct('bairro', query);
    
    return NextResponse.json({ 
      data: bairros.filter(Boolean).sort() 
    });
    
  } catch (error) {
    console.error('Erro ao buscar bairros:', error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}

// =====================================
// 6. SERVIÇOS FRONTEND
// =====================================
// app/services/index.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Buscar imóveis com filtros
export async function searchProperties(filters: any) {
  try {
    const response = await fetch(`${API_BASE}/api/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar imóveis:', error);
    return { success: false, data: [], error: error.message };
  }
}

// Buscar filtros dinâmicos
export async function getImoveisByFilters(type: string) {
  try {
    const response = await fetch(`${API_BASE}/api/properties/filters?type=${type}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar filtros:', error);
    return { data: [] };
  }
}

// Buscar bairros por cidade
export async function getBairrosPorCidade(cidade: string, categoria?: string) {
  try {
    const params = new URLSearchParams({ cidade });
    if (categoria) params.append('categoria', categoria);
    
    const response = await fetch(`${API_BASE}/api/properties/bairros?${params}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar bairros:', error);
    return { data: [] };
  }
}

// =====================================
// 7. STORE ZUSTAND
// =====================================
// app/store/filtrosStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FiltersState {
  // Filtros principais
  finalidade: string;
  categoriaSelecionada: string;
  cidadeSelecionada: string;
  bairrosSelecionados: string[];
  
  // Características
  quartos: number | string | null;
  banheiros: number | string | null;
  vagas: number | string | null;
  
  // Preços
  precoMin: string | null;
  precoMax: string | null;
  
  // Área
  areaMin: string;
  areaMax: string;
  
  // Flags especiais
  abaixoMercado: boolean;
  proximoMetro: boolean;
  
  // Dados dinâmicos
  categorias: string[];
  cidades: string[];
  bairros: string[];
  
  // Flag de controle
  filtrosBasicosPreenchidos: boolean;
  
  // Actions
  setFilters: (filters: Partial<FiltersState>) => void;
  limparFiltros: () => void;
  aplicarFiltros: () => void;
}

const initialState = {
  finalidade: '',
  categoriaSelecionada: '',
  cidadeSelecionada: '',
  bairrosSelecionados: [],
  quartos: null,
  banheiros: null,
  vagas: null,
  precoMin: null,
  precoMax: null,
  areaMin: '0',
  areaMax: '0',
  abaixoMercado: false,
  proximoMetro: false,
  categorias: [],
  cidades: [],
  bairros: [],
  filtrosBasicosPreenchidos: false,
};

const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setFilters: (filters) => set((state) => ({ 
        ...state, 
        ...filters 
      })),
      
      limparFiltros: () => set(initialState),
      
      aplicarFiltros: () => set((state) => {
        const basicosPreenchidos = !!(
          state.finalidade && 
          state.cidadeSelecionada
        );
        
        return { 
          ...state, 
          filtrosBasicosPreenchidos: basicosPreenchidos 
        };
      }),
    }),
    {
      name: 'property-filters',
      partialize: (state) => ({
        finalidade: state.finalidade,
        categoriaSelecionada: state.categoriaSelecionada,
        cidadeSelecionada: state.cidadeSelecionada,
        bairrosSelecionados: state.bairrosSelecionados,
        quartos: state.quartos,
        banheiros: state.banheiros,
        vagas: state.vagas,
        precoMin: state.precoMin,
        precoMax: state.precoMax,
        areaMin: state.areaMin,
        areaMax: state.areaMax,
      })
    }
  )
);

export default useFiltersStore;

// =====================================
// 8. COMPONENTE DE RESULTADOS
// =====================================
// components/PropertyResults.tsx

'use client';

import React, { useEffect, useState } from 'react';
import useFiltersStore from '@/app/store/filtrosStore';
import { searchProperties } from '@/app/services';

interface Property {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  cidade: string;
  bairro: string;
  preco: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  imagemPrincipal: string;
  coordinates: { lat: number; lng: number } | null;
}

interface PropertyResultsProps {
  onMapUpdate?: (properties: Property[]) => void;
}

export default function PropertyResults({ onMapUpdate }: PropertyResultsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const filters = useFiltersStore();
  const filtrosBasicosPreenchidos = useFiltersStore(s => s.filtrosBasicosPreenchidos);
  
  useEffect(() => {
    if (filtrosBasicosPreenchidos) {
      loadProperties();
    } else {
      setProperties([]);
    }
  }, [filtrosBasicosPreenchidos, filters.finalidade, filters.cidadeSelecionada, filters.categoriaSelecionada]);
  
  async function loadProperties() {
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchProperties({
        finalidade: filters.finalidade,
        categoriaSelecionada: filters.categoriaSelecionada,
        cidadeSelecionada: filters.cidadeSelecionada,
        bairrosSelecionados: filters.bairrosSelecionados,
        quartos: filters.quartos,
        banheiros: filters.banheiros,
        vagas: filters.vagas,
        precoMin: filters.precoMin,
        precoMax: filters.precoMax,
        areaMin: filters.areaMin,
        areaMax: filters.areaMax,
      });
      
      if (result.success) {
        setProperties(result.data);
        onMapUpdate?.(result.data);
      } else {
        setError(result.error || 'Erro ao buscar imóveis');
        setProperties([]);
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }
  
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
  
  if (!filtrosBasicosPreenchidos) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Selecione os filtros para buscar imóveis</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadProperties}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-2">
          Nenhum imóvel encontrado
        </p>
        <p className="text-sm text-gray-500">
          {filters.finalidade === 'Alugar' ? 
            'Não encontramos imóveis para locação com estes filtros' :
            'Tente ajustar os filtros para encontrar mais resultados'
          }
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="px-4 py-2 bg-gray-50 border-b">
        <p className="text-sm text-gray-600">
          {properties.length} {properties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {properties.map((property) => (
          <div 
            key={property.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Imagem */}
            <div className="relative h-48 bg-gray-200">
              <img 
                src={property.imagemPrincipal} 
                alt={property.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
              
              {/* Badge do código */}
              <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                Cod: {property.codigo}
              </div>
              
              {/* Badge de transação */}
              <div className="absolute top-2 right-2 bg-white/90 text-black px-2 py-1 rounded text-xs font-semibold">
                {filters.finalidade}
              </div>
            </div>
            
            {/* Informações */}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 text-gray-900">
                {property.titulo}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3">
                {property.bairro ? `${property.bairro}, ` : ''}{property.cidade}
              </p>
              
              {/* Preço */}
              <p className="text-2xl font-bold text-black mb-3">
                {formatPrice(property.preco)}
                {filters.finalidade === 'Alugar' && (
                  <span className="text-sm font-normal text-gray-600">/mês</span>
                )}
              </p>
              
              {/* Características */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {property.area > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{property.area}</span>
                    <span>m²</span>
                  </div>
                )}
                {property.quartos > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{property.quartos}</span>
                    <span>{property.quartos === 1 ? 'Quarto' : 'Quartos'}</span>
                  </div>
                )}
                {property.vagas > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{property.vagas}</span>
                    <span>{property.vagas === 1 ? 'Vaga' : 'Vagas'}</span>
                  </div>
                )}
              </div>
              
              {/* Botão */}
              <button className="w-full mt-4 bg-black text-white py-2 rounded hover:bg-gray-800 text-sm font-medium">
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// =====================================
// 9. PÁGINA PRINCIPAL DE BUSCA
// =====================================
// app/buscar/[...slug]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import PropertyFilters from '@/components/PropertyFilters';
import PropertyResults from '@/components/PropertyResults';
import useFiltersStore from '@/app/store/filtrosStore';

// Lazy load do mapa
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse" />
});

export default function BuscarPage() {
  const params = useParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [mapProperties, setMapProperties] = useState([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const setFilters = useFiltersStore(s => s.setFilters);
  const aplicarFiltros = useFiltersStore(s => s.aplicarFiltros);
  
  // Parse URL params
  useEffect(() => {
    if (params.slug && Array.isArray(params.slug)) {
      const [finalidade, tipo, ...resto] = params.slug;
      
      // Normalizar finalidade da URL
      let finalidadeNormalizada = '';
      if (finalidade === 'comprar') finalidadeNormalizada = 'Comprar';
      else if (finalidade === 'alugar') finalidadeNormalizada = 'Alugar';
      
      // Normalizar tipo
      let tipoNormalizado = '';
      if (tipo) {
        tipoNormalizado = tipo
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      // Aplicar filtros da URL
      if (finalidadeNormalizada || tipoNormalizado) {
        setFilters({
          finalidade: finalidadeNormalizada,
          categoriaSelecionada: tipoNormalizado,
        });
        
        // Se tiver cidade nos parâmetros
        if (resto.length > 0) {
          const cidade = resto.join(' ')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setFilters({ cidadeSelecionada: cidade });
        }
      }
    }
  }, [params.slug]);
  
  const handleFilterApply = () => {
    aplicarFiltros();
    setShowFilters(false);
  };
  
  const handleMapUpdate = (properties: any[]) => {
    setMapProperties(properties);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Imóveis</h1>
            
            {/* Desktop filter button */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
              </button>
              
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`}
                >
                  Mapa
                </button>
              </div>
            </div>
            
            {/* Mobile filter button */}
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden px-4 py-2 bg-black text-white rounded-lg"
            >
              Filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Desktop filters bar */}
      <PropertyFilters
        onFilter={handleFilterApply}
        isVisible={showFilters}
        setIsVisible={setShowFilters}
        horizontal={true}
      />
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
        {/* Results */}
        <div className={`flex-1 overflow-y-auto ${viewMode === 'map' ? 'hidden md:block md:w-1/2' : ''}`}>
          <PropertyResults onMapUpdate={handleMapUpdate} />
        </div>
        
        {/* Map */}
        {viewMode === 'map' && (
          <div className="flex-1 h-full">
            <PropertyMap properties={mapProperties} />
          </div>
        )}
      </div>
      
      {/* Mobile filters modal */}
      <PropertyFilters
        onFilter={handleFilterApply}
        isVisible={showFilters}
        setIsVisible={setShowFilters}
        horizontal={false}
      />
    </div>
  );
}

// =====================================
// 10. COMPONENTE DO MAPA (OPCIONAL)
// =====================================
// components/PropertyMap.tsx

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Property {
  id: string;
  titulo: string;
  preco: number;
  coordinates: { lat: number; lng: number } | null;
}

interface PropertyMapProps {
  properties: Property[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  useEffect(() => {
    // Inicializar mapa
    if (!mapRef.current) {
      mapRef.current = L.map('property-map').setView([-23.5505, -46.6333], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }
    
    // Limpar markers antigos
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Adicionar novos markers
    properties.forEach(property => {
      if (property.coordinates) {
        const marker = L.marker([property.coordinates.lat, property.coordinates.lng])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${property.titulo}</h3>
              <p class="text-lg">R$ ${property.preco.toLocaleString('pt-BR')}</p>
            </div>
          `);
        
        markersRef.current.push(marker);
      }
    });
    
    // Ajustar bounds se houver markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [properties]);
  
  return <div id="property-map" className="w-full h-full" />;
}

// =====================================
// 11. VARIÁVEIS DE AMBIENTE
// =====================================
// .env.local

/*
MONGODB_URI=mongodb+srv://seu-usuario:sua-senha@cluster.mongodb.net/seu-database?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Para produção na Vercel:
# MONGODB_URI=mongodb+srv://...
# NEXT_PUBLIC_API_URL=https://seu-site.vercel.app
# NODE_ENV=production
*/

// =====================================
// 12. PACKAGE.JSON - DEPENDÊNCIAS
// =====================================
// package.json adicionar:

/*
{
  "dependencies": {
    "mongoose": "^8.0.0",
    "zustand": "^4.4.7",
    "leaflet": "^1.9.4",
    "@types/leaflet": "^1.9.8"
  }
}
*/

// =====================================
// 13. SCRIPT DE MIGRAÇÃO DO BANCO
// =====================================
// scripts/migrate-properties.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function migrateProperties() {
  try {
    console.log('🔄 Iniciando migração...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('properties');
    
    // Contar documentos
    const total = await collection.countDocuments();
    console.log(`📊 Total de imóveis: ${total}`);
    
    // Migrar imóveis para VENDA
    const vendaResult = await collection.updateMany(
      {
        $or: [
          { tipo_transacao: 'venda' },
          { dealType: 'sale' },
          { transactionType: 'venda' }
        ]
      },
      {
        $set: {
          transactionType: 'venda',
          forSale: true,
          forRent: false,
          status: 'active',
          published: true
        }
      }
    );
    console.log(`✅ ${vendaResult.modifiedCount} imóveis de VENDA atualizados`);
    
    // Migrar imóveis para LOCAÇÃO
    const locacaoResult = await collection.updateMany(
      {
        $or: [
          { tipo_transacao: { $in: ['aluguel', 'locacao'] } },
          { dealType: 'rent' },
          { transactionType: { $in: ['locacao', 'aluguel'] } }
        ]
      },
      {
        $set: {
          transactionType: 'locacao',
          forRent: true,
          forSale: false,
          status: 'active',
          published: true
        }
      }
    );
    console.log(`✅ ${locacaoResult.modifiedCount} imóveis de LOCAÇÃO atualizados`);
    
    // Migrar imóveis VENDA E LOCAÇÃO
    const ambosResult = await collection.updateMany(
      {
        $or: [
          { tipo_transacao: 'venda_e_locacao' },
          { $and: [{ forSale: true }, { forRent: true }] }
        ]
      },
      {
        $set: {
          transactionType: 'venda_e_locacao',
          forRent: true,
          forSale: true,
          status: 'active',
          published: true
        }
      }
    );
    console.log(`✅ ${ambosResult.modifiedCount} imóveis VENDA E LOCAÇÃO atualizados`);
    
    // Garantir que todos tenham status
    const statusResult = await collection.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active', published: true } }
    );
    console.log(`✅ ${statusResult.modifiedCount} imóveis sem status atualizados`);
    
    // Criar índices
    console.log('📍 Criando índices...');
    await collection.createIndex({ transactionType: 1, status: 1, published: 1 });
    await collection.createIndex({ forSale: 1, forRent: 1 });
    await collection.createIndex({ cidade: 1, propertyType: 1 });
    await collection.createIndex({ precoVenda: 1, precoLocacao: 1 });
    console.log('✅ Índices criados');
    
    console.log('🎉 Migração concluída com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrateProperties();
