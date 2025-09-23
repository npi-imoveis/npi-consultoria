// src/app/api/imoveis/mapa/route.js
import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = request.nextUrl;
    const categoria = searchParams.get("categoria");
    const cidade = searchParams.get("cidade");
    const bairros = searchParams.getAll("bairros");
    const quartos = searchParams.get("quartos");
    const banheiros = searchParams.get("banheiros");
    const vagas = searchParams.get("vagas");
    
    const filtro = {
      Latitude: { $exists: true, $ne: null, $ne: "" },
      Longitude: { $exists: true, $ne: null, $ne: "" },
    };
    
    if (categoria) filtro.Categoria = categoria;
    if (cidade) filtro.Cidade = cidade;
    
    if (bairros && bairros.length > 0) {
      const normalizarBairro = (bairro) => {
        const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];
        return bairro.toLowerCase().split(' ').map((palavra, index) => {
          if (index === 0) return palavra.charAt(0).toUpperCase() + palavra.slice(1);
          if (preposicoes.includes(palavra)) return palavra;
          return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }).join(' ').trim();
      };
      
      const bairrosProcessados = [];
      bairros.forEach(bairro => {
        if (bairro.includes(',')) {
          bairro.split(',').forEach(b => bairrosProcessados.push(b.trim()));
        } else {
          bairrosProcessados.push(bairro.trim());
        }
      });
      
      const bairrosParaBusca = [];
      bairrosProcessados.forEach(bairro => {
        const original = bairro.trim();
        const normalizado = normalizarBairro(original);
        bairrosParaBusca.push(original);
        if (original !== normalizado) bairrosParaBusca.push(normalizado);
        bairrosParaBusca.push(original.toLowerCase());
        bairrosParaBusca.push(original.toUpperCase());
      });
      
      const bairrosUnicos = [...new Set(bairrosParaBusca)];
      filtro.$or = [
        { BairroComercial: { $in: bairrosUnicos } },
        { Bairro: { $in: bairrosUnicos } }
      ];
    }
    
    if (quartos) {
      if (quartos === "4+") filtro.Quartos = { $gte: 4 };
      else filtro.Quartos = parseInt(quartos);
    }
    
    if (banheiros) {
      if (banheiros === "4+") filtro.Banheiros = { $gte: 4 };
      else filtro.Banheiros = parseInt(banheiros);
    }
    
    if (vagas) {
      if (vagas === "4+") filtro.Vagas = { $gte: 4 };
      else filtro.Vagas = parseInt(vagas);
    }
    
    // CORREÇÃO IMPORTANTE: Não usar .select() para garantir que todos os campos venham
    // Vamos buscar tudo e depois filtrar o que precisamos
    const imoveis = await Imovel.find(filtro)
      .limit(200)
      .lean()
      .exec();
    
    // Processar os imóveis para garantir que o campo Foto está correto
    const imoveisProcessados = imoveis.map(imovel => {
      // Extrair apenas os campos necessários
      const imovelLimpo = {
        _id: imovel._id,
        Codigo: imovel.Codigo,
        Empreendimento: imovel.Empreendimento,
        Latitude: imovel.Latitude,
        Longitude: imovel.Longitude,
        ValorVenda: imovel.ValorVenda,
        ValorLocacao: imovel.ValorLocacao,
        BairroComercial: imovel.BairroComercial,
        Bairro: imovel.Bairro,
        Endereco: imovel.Endereco,
        AreaPrivativa: imovel.AreaPrivativa,
        AreaConstruida: imovel.AreaConstruida,
        Dormitorios: imovel.Dormitorios,
        Quartos: imovel.Quartos,
        Banheiros: imovel.Banheiros,
        Vagas: imovel.Vagas,
        TipoNegocio: imovel.TipoNegocio,
        TipoImovel: imovel.TipoImovel,
      };
      
      // Processar o campo Foto
      if (imovel.Foto && Array.isArray(imovel.Foto)) {
        // Garantir que o array Foto está completo
        imovelLimpo.Foto = imovel.Foto;
        
        // Adicionar foto destaque processada para facilitar
        const fotoDestaque = imovel.Foto.find(f => f?.Destaque === "Sim" && f?.Foto);
        if (fotoDestaque) {
          imovelLimpo._fotoDestaqueProcessada = fotoDestaque.Foto;
        } else {
          // Pegar primeira foto disponível
          const primeiraFoto = imovel.Foto.find(f => f?.Foto);
          if (primeiraFoto) {
            imovelLimpo._fotoDestaqueProcessada = primeiraFoto.Foto;
          }
        }
      }
      
      // Campos alternativos de foto
      if (!imovelLimpo._fotoDestaqueProcessada) {
        if (imovel.FotoDestaque) imovelLimpo._fotoDestaqueProcessada = imovel.FotoDestaque;
        else if (imovel.FotoPrincipal) imovelLimpo._fotoDestaqueProcessada = imovel.FotoPrincipal;
        else if (imovel.imagemDestaque) imovelLimpo._fotoDestaqueProcessada = imovel.imagemDestaque;
      }
      
      return imovelLimpo;
    });
    
    // Headers para evitar cache
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return NextResponse.json({
      status: 200,
      count: imoveisProcessados.length,
      data: imoveisProcessados,
      debug: {
        primeiroImovel: imoveisProcessados[0] ? {
          codigo: imoveisProcessados[0].Codigo,
          temFoto: !!imoveisProcessados[0].Foto,
          qtdFotos: imoveisProcessados[0].Foto?.length || 0,
          fotoDestaque: imoveisProcessados[0]._fotoDestaqueProcessada || 'Sem foto'
        } : null
      }
    }, { headers });
    
  } catch (error) {
    console.error("Erro ao buscar imóveis para o mapa:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
