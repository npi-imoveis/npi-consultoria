// src/app/api/imoveis/mapa/route.js
import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Conectar ao banco (se necessário)
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
    
    console.log("Filtro da API do mapa:", filtro);
    
    // CORREÇÃO PRINCIPAL: Incluir TODOS os campos necessários para o card do mapa
    const imoveis = await Imovel.find(filtro)
      .select(`
        Empreendimento 
        Latitude 
        Longitude 
        ValorVenda 
        ValorLocacao
        BairroComercial 
        Codigo 
        Endereco 
        Foto 
        FotoDestaque 
        imagemDestaque
        AreaPrivativa 
        AreaConstruida 
        Dormitorios 
        Quartos
        Banheiros 
        Vagas
        TipoNegocio
        TipoImovel
        _id
      `)
      .limit(200)
      .lean();
    
    // LOG para debug - verificar estrutura dos dados
    console.log(`API Mapa: ${imoveis.length} imóveis encontrados`);
    
    if (imoveis.length > 0) {
      console.log("=== ESTRUTURA DO PRIMEIRO IMÓVEL ===");
      console.log("Campos principais:", {
        Codigo: imoveis[0].Codigo,
        Empreendimento: imoveis[0].Empreendimento,
        temFoto: !!imoveis[0].Foto,
        quantidadeFotos: imoveis[0].Foto?.length || 0,
        temFotoDestaque: !!imoveis[0].FotoDestaque,
        temImagemDestaque: !!imoveis[0].imagemDestaque,
        AreaPrivativa: imoveis[0].AreaPrivativa,
        Dormitorios: imoveis[0].Dormitorios,
        Quartos: imoveis[0].Quartos,
        Vagas: imoveis[0].Vagas
      });
      
      // Log da estrutura do array Foto
      if (imoveis[0].Foto && Array.isArray(imoveis[0].Foto) && imoveis[0].Foto.length > 0) {
        console.log("Estrutura primeira foto:", {
          temCampoFoto: !!imoveis[0].Foto[0].Foto,
          temCampoUrl: !!imoveis[0].Foto[0].url,
          temCampoSrc: !!imoveis[0].Foto[0].src,
          temCampoDestaque: !!imoveis[0].Foto[0].Destaque,
          valorDestaque: imoveis[0].Foto[0].Destaque,
          primeiraFotoURL: imoveis[0].Foto[0].Foto || imoveis[0].Foto[0].url || imoveis[0].Foto[0].src || 'Nenhuma URL encontrada'
        });
      }
    }
    
    // Processar imóveis para garantir que a foto destaque esteja disponível
    const imoveisProcessados = imoveis.map(imovel => {
      // Encontrar a foto destaque
      let fotoDestaque = null;
      
      // Tentar encontrar no array Foto
      if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
        // Procurar por Destaque = "Sim"
        const fotoComDestaque = imovel.Foto.find(f => f?.Destaque === "Sim" && f?.Foto);
        if (fotoComDestaque) {
          fotoDestaque = fotoComDestaque.Foto;
        } else {
          // Se não encontrar, pegar a primeira foto disponível
          const primeiraFotoValida = imovel.Foto.find(f => f?.Foto);
          if (primeiraFotoValida) {
            fotoDestaque = primeiraFotoValida.Foto;
          }
        }
      }
      
      // Se não encontrou no array, tentar campos alternativos
      if (!fotoDestaque) {
        fotoDestaque = imovel.FotoDestaque || imovel.imagemDestaque;
      }
      
      // Adicionar a foto destaque processada ao objeto
      return {
        ...imovel,
        _fotoDestaqueProcessada: fotoDestaque // Campo auxiliar com a foto já processada
      };
    });
    
    return NextResponse.json({
      status: 200,
      count: imoveisProcessados.length,
      data: imoveisProcessados,
    });
    
  } catch (error) {
    console.error("Erro ao buscar imóveis para o mapa:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
