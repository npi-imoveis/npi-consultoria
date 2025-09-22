import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel, { IImovel } from "@/app/models/Imovel";
import { Model } from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = request.nextUrl;
    const categoria = searchParams.get("categoria");
    const cidade = searchParams.get("cidade");
    const bairros = searchParams.getAll("bairros");
    const quartos = searchParams.get("quartos");
    const banheiros = searchParams.get("banheiros");
    const vagas = searchParams.get("vagas");

    // Construir o filtro base
    const filtro = {
      Latitude: { $exists: true, $ne: null, $ne: "" },
      Longitude: { $exists: true, $ne: null, $ne: "" },
      Foto: { $exists: true, $ne: null, $ne: "" },
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

    // --- CORREÇÃO APLICADA AQUI ---
    // Buscar imóveis com os filtros aplicados, selecionando explicitamente os campos necessários.
    // O "+Foto" força a inclusão do campo 'Foto', mesmo que ele esteja com "select: false" no Schema.
    const imoveis = await Imovel.find(filtro)
      .select('Empreendimento Latitude Longitude ValorVenda BairroComercial Codigo Endereco +Foto')
      .limit(200)
      .lean(); // Adicionar .lean() para uma performance muito superior em buscas "read-only".

    return NextResponse.json({
      status: 200,
      count: imoveis.length,
      data: imoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis para o mapa:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
