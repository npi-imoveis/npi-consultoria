import { connectToDatabase } from "@/app/lib/mongodb";
import Cdimag from "@/app/models/Cdimag";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Código do imóvel não fornecido",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar todos os documentos em Cdimag que possuem o codigoO igual ao código do imóvel
    const vinculos = await Cdimag.find({ codigoO: Number(id) });

    if (!vinculos.length) {
      return NextResponse.json({
        status: 404,
        message: "Nenhum vínculo encontrado para este imóvel",
        data: [],
      });
    }

    // Extrair todos os códigos de corretores (codigoD) dos documentos encontrados
    const codigosCorretores = vinculos.map((vinculo) => vinculo.codigoD);

    // Buscar os corretores correspondentes
    const corretores = await Corretores.find({
      codigoD: { $in: codigosCorretores },
      inativo: "Nao",
    });

    return NextResponse.json({
      status: 200,
      message: "Corretores vinculados ao imóvel encontrados com sucesso",
      data: {
        vinculos,
        corretores,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar corretores vinculados ao imóvel:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar corretores vinculados ao imóvel",
      },
      { status: 500 }
    );
  }
}
