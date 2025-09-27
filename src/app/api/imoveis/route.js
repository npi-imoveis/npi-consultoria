import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";
import cache from "@/app/lib/cache";
import ImovelAtivo from "@/app/models/ImovelAtivo";
import ImovelInativo from "@/app/models/ImovelInativo";
import { onPropertyChange } from "@/app/utils/city-sync-helper";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;

    // Parâmetros de paginação
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    // Criar uma chave única para o cache baseada nos parâmetros
    const cacheKey = `imoveis_page${page}_limit${limit}`;

    // Verificar se os dados estão em cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    await connectToDatabase();

    // Removido filtro de ValorAntigo - buscar todos os imóveis
    const filtro = {};

    // Pipeline de agregação para garantir códigos únicos
    const imoveisAgregados = await Imovel.aggregate([
      // Filtrar conforme os critérios iniciais (agora sem filtro de valor)
      { $match: filtro },
      // Agrupar por Codigo e manter apenas o documento mais recente
      {
        $group: {
          _id: "$Codigo",
          doc: { $first: "$$ROOT" },
        },
      },
      // Desempacotar o documento para preservar a estrutura original
      { $replaceRoot: { newRoot: "$doc" } },
      // Contar total para paginação
      {
        $facet: {
          total: [{ $count: "count" }],
          // Aplicar paginação
          dados: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    // Extrair os resultados da agregação
    const imoveisPaginados = imoveisAgregados[0]?.dados || [];
    const totalItems = imoveisAgregados[0]?.total[0]?.count || 0;

    // Calcular o total de páginas
    const totalPages = Math.ceil(totalItems / limit);

    const response = {
      status: 200,
      data: imoveisPaginados,
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

    // Verificar se o Slug foi fornecido
    if (!dadosImovel.Slug) {
      return NextResponse.json(
        {
          status: 400,
          error: "O campo Slug é obrigatório",
        },
        { status: 400 }
      );
    }

    // Verificar se já existe um imóvel com o mesmo Slug (que não seja o atual)
    const slugExistente = await Imovel.findOne({
      Slug: dadosImovel.Slug,
      Codigo: { $ne: dadosImovel.Codigo },
    });

    if (slugExistente) {
      return NextResponse.json(
        {
          status: 400,
          error: "Já existe um imóvel com este Slug. Por favor, use um Slug único.",
        },
        { status: 400 }
      );
    }

    let imovelSalvo;
    let imovelAtivoSalvo = null;
    let imovelInativoSalvo = null;
    let message = "Imóvel criado com sucesso";

    // Verificar se já existe um imóvel com o mesmo Codigo
    const imovelExistente = await Imovel.findOne({ Codigo: dadosImovel.Codigo });

    // Atualizar ou criar no modelo Imovel principal (independente de estar ativo ou não)
    if (imovelExistente) {
      // Atualizar o imóvel existente
      imovelSalvo = await Imovel.findOneAndUpdate({ Codigo: dadosImovel.Codigo }, dadosImovel, {
        new: true,
        upsert: false,
      });
      message = "Imóvel atualizado com sucesso";
    } else {
      // Criar um novo imóvel
      const novoImovel = new Imovel(dadosImovel);
      imovelSalvo = await novoImovel.save();
    }

    // Gerenciar modelos ImovelAtivo e ImovelInativo baseado no campo Ativo
    if (dadosImovel.Ativo === "Sim") {
      // Se está ativo, deve estar em ImovelAtivo
      const imovelAtivoExistente = await ImovelAtivo.findOne({ Codigo: dadosImovel.Codigo });

      if (imovelAtivoExistente) {
        // Atualizar o imóvel ativo existente
        imovelAtivoSalvo = await ImovelAtivo.findOneAndUpdate(
          { Codigo: dadosImovel.Codigo },
          dadosImovel,
          { new: true, upsert: false }
        );
      } else {
        // Criar um novo imóvel ativo
        const novoImovelAtivo = new ImovelAtivo(dadosImovel);
        imovelAtivoSalvo = await novoImovelAtivo.save();
      }

      // Remover da coleção de inativos se existir
      await ImovelInativo.deleteOne({ Codigo: dadosImovel.Codigo });
    } else if (dadosImovel.Ativo === "Não") {
      // Se está inativo, deve estar em ImovelInativo e não em ImovelAtivo
      const imovelInativoExistente = await ImovelInativo.findOne({ Codigo: dadosImovel.Codigo });

      if (imovelInativoExistente) {
        // Atualizar o imóvel inativo existente
        imovelInativoSalvo = await ImovelInativo.findOneAndUpdate(
          { Codigo: dadosImovel.Codigo },
          dadosImovel,
          { new: true, upsert: false }
        );
      } else {
        // Criar um novo imóvel inativo
        const novoImovelInativo = new ImovelInativo(dadosImovel);
        imovelInativoSalvo = await novoImovelInativo.save();
      }

      // Remover da coleção de ativos se existir
      await ImovelAtivo.deleteOne({ Codigo: dadosImovel.Codigo });
    }

    // Invalidar cache relacionado a imóveis
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith("imoveis_")) {
        cache.del(key);
      }
    });

    // Triggerar sincronização de cidades se houver cidade no imóvel
    if (dadosImovel.Cidade) {
      const operation = imovelExistente ? 'update' : 'create';
      onPropertyChange(dadosImovel, operation, 'api');
    }

    return NextResponse.json(
      {
        status: 200,
        success: true,
        message: message,
        data: imovelSalvo,
        imovelAtivo: imovelAtivoSalvo,
        imovelInativo: imovelInativoSalvo,
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

export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    await connectToDatabase();

    // Buscar o imóvel antes de deletar para triggerar sincronização
    const imovelParaDeletar = await Imovel.findOne({ Codigo: id });

    await Imovel.deleteOne({ Codigo: id });
    await ImovelAtivo.deleteOne({ Codigo: id });
    await ImovelInativo.deleteOne({ Codigo: id });

    // Triggerar sincronização se o imóvel tinha cidade
    if (imovelParaDeletar?.Cidade) {
      onPropertyChange(imovelParaDeletar, 'delete', 'api');
    }

    return NextResponse.json({ success: true, message: "Imóvel deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao deletar imóvel" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    // Verificar se o imóvel existe
    const imovelExistente = await Imovel.findOne({ Codigo: dadosImovel.Codigo });
    if (!imovelExistente) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel não encontrado para atualização",
        },
        { status: 404 }
      );
    }

    // Atualizar o imóvel existente
    const imovelAtualizado = await Imovel.findOneAndUpdate(
      { Codigo: dadosImovel.Codigo },
      dadosImovel,
      { new: true, upsert: false }
    );

    let imovelAtivoAtualizado = null;
    let imovelInativoAtualizado = null;

    // Gerenciar modelos ImovelAtivo e ImovelInativo baseado no campo Ativo
    if (dadosImovel.Ativo === "Sim") {
      // Atualizar ou criar em ImovelAtivo
      const imovelAtivoExistente = await ImovelAtivo.findOne({ Codigo: dadosImovel.Codigo });
      if (imovelAtivoExistente) {
        imovelAtivoAtualizado = await ImovelAtivo.findOneAndUpdate(
          { Codigo: dadosImovel.Codigo },
          dadosImovel,
          { new: true, upsert: false }
        );
      } else {
        const novoImovelAtivo = new ImovelAtivo(dadosImovel);
        imovelAtivoAtualizado = await novoImovelAtivo.save();
      }
      // Remover da coleção de inativos se existir
      await ImovelInativo.deleteOne({ Codigo: dadosImovel.Codigo });
    } else if (dadosImovel.Ativo === "Não") {
      // Atualizar ou criar em ImovelInativo
      const imovelInativoExistente = await ImovelInativo.findOne({ Codigo: dadosImovel.Codigo });
      if (imovelInativoExistente) {
        imovelInativoAtualizado = await ImovelInativo.findOneAndUpdate(
          { Codigo: dadosImovel.Codigo },
          dadosImovel,
          { new: true, upsert: false }
        );
      } else {
        const novoImovelInativo = new ImovelInativo(dadosImovel);
        imovelInativoAtualizado = await novoImovelInativo.save();
      }
      // Remover da coleção de ativos se existir
      await ImovelAtivo.deleteOne({ Codigo: dadosImovel.Codigo });
    }

    // Invalidar cache relacionado a imóveis
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith("imoveis_")) {
        cache.del(key);
      }
    });

    // Triggerar sincronização de cidades se houver cidade no imóvel
    if (dadosImovel.Cidade) {
      onPropertyChange(dadosImovel, 'update', 'api');
    }

    return NextResponse.json(
      {
        status: 200,
        success: true,
        message: "Imóvel atualizado com sucesso",
        data: imovelAtualizado,
        imovelAtivo: imovelAtivoAtualizado,
        imovelInativo: imovelInativoAtualizado,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
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
