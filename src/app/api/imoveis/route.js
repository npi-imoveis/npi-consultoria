import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel, { IImovel } from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import cache from "@/app/lib/cache";
import ImovelAtivo from "@/app/models/ImovelAtivo";

export async function GET(request) {
  try {
    const url = new URL(request.url);

    // Parâmetros de paginação
    const limit = parseInt(url.searchParams.get("limit") || "25", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // Criar uma chave única para o cache baseada nos parâmetros
    const cacheKey = `imoveis_page${page}_limit${limit}`;

    // Verificar se os dados estão em cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    await connectToDatabase();

    // Filtro para imóveis com ValorAntigo diferente de "0" e ""
    const filtro = {
      ValorAntigo: { $exists: true, $nin: ["0", ""] },
    };

    // Contar o total de documentos com o filtro aplicado
    const totalItems = await Imovel.countDocuments(filtro);

    // Calcular o total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    // Buscar imóveis com paginação e filtro
    const imoveis = await Imovel.find(filtro).skip(skip).limit(limit);

    const response = {
      status: 200,
      data: imoveis,
      paginacao: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };

    // Armazenar os dados em cache
    cache.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar imóveis:", error);
    return NextResponse.json(
      {
        message: "Erro ao buscar imóveis",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log("Processando imóvel");

  try {
    await connectToDatabase();

    // Obter os dados do corpo da requisição
    const dadosImovel = await request.json();

    // Verificar se o Codigo foi fornecido
    if (!dadosImovel.Codigo) {
      return NextResponse.json(
        {
          status: 400,
          error: "O campo Codigo é obrigatório",
        },
        { status: 400 }
      );
    }

    // Se o _id foi fornecido, tenta excluir o documento existente primeiro
    if (dadosImovel._id) {
      try {
        await Imovel.deleteOne({ _id: dadosImovel._id });
        console.log(`Documento anterior com _id ${dadosImovel._id} excluído`);
      } catch (deleteError) {
        console.log("Erro ao excluir documento anterior (pode não existir):", deleteError);
      }
    }

    // Criar um novo documento
    const novoImovel = new Imovel(dadosImovel);
    const imovelSalvo = await novoImovel.save();

    const novoImovelAtivo = new ImovelAtivo(dadosImovel);
    const imovelAtivoSalvo = await novoImovelAtivo.save();

    console.log(`Imóvel com Codigo ${dadosImovel.Codigo} processado com sucesso`);

    // Invalidar cache relacionado a imóveis
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith("imoveis_")) {
        cache.del(key);
      }
    });

    return NextResponse.json(
      {
        status: 200,
        success: true,
        message: "Imóvel processado com sucesso",
        data: imovelSalvo,
        imovelAtivo: imovelAtivoSalvo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar imóvel:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
