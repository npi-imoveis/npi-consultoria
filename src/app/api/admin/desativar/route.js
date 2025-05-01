import { connectToDatabase } from "@/app/lib/mongodb";
import ImovelAtivo from "@/app/models/ImovelAtivo";
import ImovelInativo from "@/app/models/ImovelInativo";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import cache from "@/app/lib/cache";

export async function POST(request) {
  try {
    await connectToDatabase();

    // Obter o código do imóvel do corpo da requisição
    const { codigo } = await request.json();

    if (!codigo) {
      return NextResponse.json(
        {
          status: 400,
          success: false,
          error: "O código do imóvel é obrigatório",
        },
        { status: 400 }
      );
    }

    // Buscar o imóvel ativo pelo código
    const imovelAtivo = await ImovelAtivo.findOne({ Codigo: codigo });

    if (!imovelAtivo) {
      return NextResponse.json(
        {
          status: 404,
          success: false,
          error: "Imóvel não encontrado na coleção de imóveis ativos",
        },
        { status: 404 }
      );
    }

    // Definir o imóvel como inativo
    const imovelDados = imovelAtivo.toObject();
    imovelDados.Ativo = "Não";

    // Criar o imóvel na coleção de inativos
    const novoImovelInativo = new ImovelInativo(imovelDados);
    await novoImovelInativo.save();

    // Atualizar também o imóvel na coleção principal (se existir)
    const imovelPrincipal = await Imovel.findOne({ Codigo: codigo });
    if (imovelPrincipal) {
      imovelPrincipal.Ativo = "Não";
      await imovelPrincipal.save();
    }

    // Remover o imóvel da coleção de ativos
    await ImovelAtivo.deleteOne({ Codigo: codigo });

    // Invalidar cache relacionado a imóveis
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith("imoveis_")) {
        cache.del(key);
      }
    });

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel desativado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao desativar imóvel:", error);
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
