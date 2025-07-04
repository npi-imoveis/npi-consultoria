import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import Imovel from "@/app/models/Imovel";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  await connectToDatabase();

  try {
    const corretor = await Corretores.findOne({ codigoD: id });

    // --- MODIFICAÇÃO AQUI: Verificar se o corretor foi encontrado antes de acessar suas propriedades ---
    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 }); // Retorna 404 se não encontrar
    }

    // Extract Codigo values from imoveis_vinculados
    const codigosImoveis = corretor.imoveis_vinculados?.map((imovel) => imovel.Codigo) || [];

    // Fetch linked properties with specific fields
    const imoveisVinculados = await Imovel.find(
      { Codigo: { $in: codigosImoveis } },
      { Codigo: 1, Empreendimento: 1, Categoria: 1, ValorAntigo: 1, _id: 0 }
    );

    return NextResponse.json({
      status: 200,
      data: {
        corretor,
        imoveis: imoveisVinculados || [], // Retorna array vazio se não houver imóveis vinculados
      },
    });
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 }); // Erro genérico para outros problemas
  }
}

// Mantenha as funções DELETE, POST e PUT como estão no seu arquivo original.


// ---------------------------------- //
// ---------DELETAR CORRETOR --------//
// ---------------------------------- //

export async function DELETE(request) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  try {
    await connectToDatabase();

    const corretor = await Corretores.findOne({
      codigoD: id,
    });

    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    await Corretores.deleteOne({ codigoD: id });

    return NextResponse.json({ message: "Corretor deletado com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar corretor:", error);
    return NextResponse.json({ error: "Erro ao deletar corretor" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    await connectToDatabase();

    // Verificar se já existe um corretor com o mesmo codigoD
    const existingCorretor = await Corretores.findOne({ codigoD: data.codigoD });
    if (existingCorretor) {
      return NextResponse.json({ error: "Já existe um corretor com este código" }, { status: 409 });
    }

    // Criar novo corretor
    const newCorretor = await Corretores.create(data);

    return NextResponse.json(
      { message: "Corretor criado com sucesso", corretor: newCorretor },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar corretor:", error);
    return NextResponse.json({ error: "Erro ao criar corretor" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID do corretor não fornecido" }, { status: 400 });
    }

    await connectToDatabase();

    // Se estiver tentando atualizar o codigoD, verificar se já existe
    if (data.codigoD) {
      const existingCorretor = await Corretores.findOne({
        codigoD: data.codigoD,
        _id: { $ne: id }, // Excluir o corretor atual da busca
      });

      if (existingCorretor) {
        return NextResponse.json(
          { error: "Já existe outro corretor com este código" },
          { status: 409 }
        );
      }
    }

    const updatedCorretor = await Corretores.findByIdAndUpdate(id, { $set: data }, { new: true });

    if (!updatedCorretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Corretor atualizado com sucesso",
      corretor: updatedCorretor,
    });
  } catch (error) {
    console.error("Erro ao atualizar corretor:", error);
    return NextResponse.json({ error: "Erro ao atualizar corretor" }, { status: 500 });
  }
}
