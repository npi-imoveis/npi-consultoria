import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: 400, error: "ID obrigatório" }, { status: 400 });
    }

    await connectToDatabase();

    // Buscar o imóvel de referência
    const imovelReferencia = await Imovel.findOne({ Codigo: id });
    if (!imovelReferencia) {
      return NextResponse.json({ status: 404, error: "Imóvel não encontrado" }, { status: 404 });
    }

    // DEBUG: Buscar TODOS do mesmo empreendimento SEM FILTROS
    let todosDoMesmoEmpreendimento = [];
    let todosDoMesmoEndereco = [];
    
    if (imovelReferencia.Empreendimento) {
      todosDoMesmoEmpreendimento = await Imovel.find({
        Codigo: { $ne: id },
        Empreendimento: imovelReferencia.Empreendimento
      }).select('Codigo Empreendimento Endereco Numero Categoria AreaPrivativa ValorAntigo Bairro').lean();
    }

    if (imovelReferencia.Endereco && imovelReferencia.Numero) {
      todosDoMesmoEndereco = await Imovel.find({
        Codigo: { $ne: id },
        Endereco: imovelReferencia.Endereco,
        Numero: imovelReferencia.Numero
      }).select('Codigo Empreendimento Endereco Numero Categoria AreaPrivativa ValorAntigo Bairro').lean();
    }

    // RETORNAR OS DADOS DE DEBUG DIRETAMENTE NA RESPOSTA
    return NextResponse.json({
      status: 200,
      debug: true,
      message: "DADOS DE DEBUG - Ver detalhes abaixo",
      
      imovel_referencia: {
        Codigo: imovelReferencia.Codigo,
        Empreendimento: imovelReferencia.Empreendimento,
        Endereco: imovelReferencia.Endereco,
        Numero: imovelReferencia.Numero,
        Bairro: imovelReferencia.Bairro,
        Categoria: imovelReferencia.Categoria,
        AreaPrivativa: imovelReferencia.AreaPrivativa,
        ValorAntigo: imovelReferencia.ValorAntigo
      },

      todos_mesmo_empreendimento: {
        total: todosDoMesmoEmpreendimento.length,
        empreendimento: imovelReferencia.Empreendimento,
        lista: todosDoMesmoEmpreendimento.map(i => ({
          Codigo: i.Codigo,
          Categoria: i.Categoria,
          AreaPrivativa: i.AreaPrivativa,
          ValorAntigo: i.ValorAntigo,
          tem_valor_valido: i.ValorAntigo && i.ValorAntigo !== "0" && i.ValorAntigo !== "",
          tem_area_valida: i.AreaPrivativa && i.AreaPrivativa !== ""
        }))
      },

      todos_mesmo_endereco: {
        total: todosDoMesmoEndereco.length,
        endereco: `${imovelReferencia.Endereco}, ${imovelReferencia.Numero}`,
        lista: todosDoMesmoEndereco.map(i => ({
          Codigo: i.Codigo,
          Empreendimento: i.Empreendimento,
          Categoria: i.Categoria,
          AreaPrivativa: i.AreaPrivativa,
          ValorAntigo: i.ValorAntigo
        }))
      },

      // TESTE DOS FILTROS ORIGINAIS
      teste_filtros_originais: {
        tem_area_privativa: !!imovelReferencia.AreaPrivativa,
        tem_bairro: !!imovelReferencia.Bairro,
        tem_categoria: !!imovelReferencia.Categoria,
        tem_valor: !!(imovelReferencia.ValorAntigo && imovelReferencia.ValorAntigo !== "0")
      },

      data: [] // Vazio propositalmente para focar no debug
    });

  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error.message,
      debug: true
    }, { status: 500 });
  }
}
