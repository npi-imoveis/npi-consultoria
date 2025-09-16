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
    // Capturar múltiplos bairros da URL
    const bairros = searchParams.getAll("bairros");
    const quartos = searchParams.get("quartos");
    const banheiros = searchParams.get("banheiros");
    const vagas = searchParams.get("vagas");

    // Construir o filtro base (sempre verificar latitude e longitude)
    const filtro = {
      Latitude: { $exists: true, $ne: null, $ne: "" },
      Longitude: { $exists: true, $ne: null, $ne: "" },
      Foto: { $exists: true, $ne: null, $ne: "" },
    };

    // Adicionar filtros adicionais se existirem
    if (categoria) filtro.Categoria = categoria;
    if (cidade) filtro.Cidade = cidade;

    // Adicionar filtro de bairros se tiver um ou mais bairros selecionados
    if (bairros && bairros.length > 0) {
      filtro.BairroComercial = { $in: bairros };
    }


    // Tratar filtros numéricos (quartos, banheiros, vagas)
    if (quartos) {
      if (quartos === "4+") {
        filtro.Quartos = { $gte: 4 };
      } else {
        filtro.Quartos = parseInt(quartos);
      }
    }

    if (banheiros) {
      if (banheiros === "4+") {
        filtro.Banheiros = { $gte: 4 };
      } else {
        filtro.Banheiros = parseInt(banheiros);
      }
    }

    if (vagas) {
      if (vagas === "4+") {
        filtro.Vagas = { $gte: 4 };
      } else {
        filtro.Vagas = parseInt(vagas);
      }
    }

    // Buscar imóveis com os filtros aplicados
    const imoveis = await Imovel.find(filtro).limit(200);

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
