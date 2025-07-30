import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          error: "É necessário fornecer o ID do imóvel",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar o imóvel de referência pelo Codigo
    const imovelReferencia = await Imovel.findOne({ Codigo: id });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel de referência não encontrado",
        },
        { status: 404 }
      );
    }

    // 🔍 DEBUG: Mostrar dados do imóvel de referência
    console.log("🏠 IMÓVEL DE REFERÊNCIA:");
    console.log("  Codigo:", imovelReferencia.Codigo);
    console.log("  Empreendimento:", imovelReferencia.Empreendimento);
    console.log("  Endereco:", imovelReferencia.Endereco);
    console.log("  Numero:", imovelReferencia.Numero);
    console.log("  Bairro:", imovelReferencia.Bairro);
    console.log("  Categoria:", imovelReferencia.Categoria);
    console.log("  AreaPrivativa:", imovelReferencia.AreaPrivativa);
    console.log("  ValorAntigo:", imovelReferencia.ValorAntigo);

    // 🔍 DEBUG: Buscar TODOS os imóveis do mesmo empreendimento (sem filtros)
    let todosDoMesmoEmpreendimento = [];
    if (imovelReferencia.Empreendimento) {
      todosDoMesmoEmpreendimento = await Imovel.find({
        Codigo: { $ne: id },
        Empreendimento: imovelReferencia.Empreendimento
      }).lean();
      
      console.log(`\n🏢 TODOS DO MESMO EMPREENDIMENTO (${imovelReferencia.Empreendimento}):`);
      console.log(`  Total encontrados: ${todosDoMesmoEmpreendimento.length}`);
      
      todosDoMesmoEmpreendimento.forEach((imovel, index) => {
        console.log(`  ${index + 1}. Codigo: ${imovel.Codigo}, Valor: ${imovel.ValorAntigo}, Area: ${imovel.AreaPrivativa}`);
      });
    }

    // 🔍 DEBUG: Buscar por endereço similar (caso o Empreendimento tenha nomes diferentes)
    let todosDoMesmoEndereco = [];
    if (imovelReferencia.Endereco && imovelReferencia.Numero) {
      todosDoMesmoEndereco = await Imovel.find({
        Codigo: { $ne: id },
        Endereco: imovelReferencia.Endereco,
        Numero: imovelReferencia.Numero
      }).lean();
      
      console.log(`\n🏠 TODOS DO MESMO ENDEREÇO (${imovelReferencia.Endereco}, ${imovelReferencia.Numero}):`);
      console.log(`  Total encontrados: ${todosDoMesmoEndereco.length}`);
      
      todosDoMesmoEndereco.forEach((imovel, index) => {
        console.log(`  ${index + 1}. Codigo: ${imovel.Codigo}, Empreendimento: ${imovel.Empreendimento}, Valor: ${imovel.ValorAntigo}`);
      });
    }

    // Verificações básicas mantidas
    if (!imovelReferencia.AreaPrivativa) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui área privativa definida",
          debug: {
            imovelReferencia: {
              Codigo: imovelReferencia.Codigo,
              Empreendimento: imovelReferencia.Empreendimento,
              AreaPrivativa: imovelReferencia.AreaPrivativa
            }
          }
        },
        { status: 400 }
      );
    }

    if (!imovelReferencia.Bairro) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui bairro definido",
          debug: {
            imovelReferencia: {
              Codigo: imovelReferencia.Codigo,
              Bairro: imovelReferencia.Bairro
            }
          }
        },
        { status: 400 }
      );
    }

    // Converter a área privativa para número
    const areaReferenciaString = imovelReferencia.AreaPrivativa.toString()
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const areaReferencia = parseFloat(areaReferenciaString);

    // Definir margem de variação (20%)
    const margemVariacao = areaReferencia * 0.2;
    const areaMinima = areaReferencia - margemVariacao;
    const areaMaxima = areaReferencia + margemVariacao;

    console.log(`\n📏 FILTROS DE ÁREA:`);
    console.log(`  Área referência: ${areaReferencia}m²`);
    console.log(`  Faixa aceita: ${areaMinima.toFixed(1)}m² - ${areaMaxima.toFixed(1)}m²`);

    // Calcular faixa de preço (±30%)
    let precoMinimo, precoMaximo;
    if (imovelReferencia.ValorAntigo && imovelReferencia.ValorAntigo !== "0") {
      const precoReferencia = parseFloat(imovelReferencia.ValorAntigo.toString().replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isNaN(precoReferencia) && precoReferencia > 0) {
        precoMinimo = precoReferencia * 0.7;
        precoMaximo = precoReferencia * 1.3;
        
        console.log(`\n💰 FILTROS DE PREÇO:`);
        console.log(`  Preço referência: R$ ${precoReferencia.toLocaleString()}`);
        console.log(`  Faixa aceita: R$ ${precoMinimo.toLocaleString()} - R$ ${precoMaximo.toLocaleString()}`);
      }
    }

    // 🔍 DEBUG: Testar filtros em cada imóvel do mesmo empreendimento
    console.log(`\n🧪 TESTANDO FILTROS EM CADA IMÓVEL DO MESMO EMPREENDIMENTO:`);
    
    const resultadosDetalhados = todosDoMesmoEmpreendimento.map((imovel, index) => {
      const resultado = {
        codigo: imovel.Codigo,
        empreendimento: imovel.Empreendimento,
        categoria: imovel.Categoria,
        valor: imovel.ValorAntigo,
        area: imovel.AreaPrivativa,
        testes: {}
      };

      // Teste 1: Valor válido
      resultado.testes.valorValido = imovel.ValorAntigo && imovel.ValorAntigo !== "0" && imovel.ValorAntigo !== "";
      
      // Teste 2: Área válida
      resultado.testes.areaExiste = imovel.AreaPrivativa && imovel.AreaPrivativa !== "";
      
      if (resultado.testes.areaExiste) {
        try {
          const areaString = imovel.AreaPrivativa.toString().replace(/[^\d.,]/g, "").replace(",", ".");
          const area = parseFloat(areaString);
          resultado.testes.areaValida = !isNaN(area) && area > 0;
          resultado.testes.areaNaFaixa = area >= areaMinima && area <= areaMaxima;
          resultado.areaNumerica = area;
        } catch (e) {
          resultado.testes.areaValida = false;
          resultado.testes.areaNaFaixa = false;
        }
      }

      // Teste 3: Preço na faixa
      if (precoMinimo && precoMaximo && resultado.testes.valorValido) {
        try {
          const precoString = imovel.ValorAntigo.toString().replace(/[^\d.,]/g, "").replace(",", ".");
          const preco = parseFloat(precoString);
          resultado.testes.precoValido = !isNaN(preco) && preco > 0;
          resultado.testes.precoNaFaixa = preco >= precoMinimo && preco <= precoMaximo;
          resultado.precoNumerico = preco;
        } catch (e) {
          resultado.testes.precoValido = false;
          resultado.testes.precoNaFaixa = false;
        }
      }

      // Teste 4: Categoria igual
      resultado.testes.mesmaCategoria = imovel.Categoria === imovelReferencia.Categoria;

      // Resultado final
      resultado.passouNosFiltros = resultado.testes.valorValido && 
                                  resultado.testes.areaExiste && 
                                  resultado.testes.areaValida && 
                                  resultado.testes.areaNaFaixa &&
                                  (precoMinimo ? resultado.testes.precoNaFaixa : true) &&
                                  resultado.testes.mesmaCategoria;

      console.log(`  ${index + 1}. Codigo ${imovel.Codigo}:`);
      console.log(`     ✅ Valor válido: ${resultado.testes.valorValido}`);
      console.log(`     ✅ Área existe: ${resultado.testes.areaExiste}`);
      console.log(`     ✅ Área válida: ${resultado.testes.areaValida}`);
      console.log(`     ✅ Área na faixa: ${resultado.testes.areaNaFaixa} (${resultado.areaNumerica}m²)`);
      console.log(`     ✅ Preço na faixa: ${resultado.testes.precoNaFaixa} (R$ ${resultado.precoNumerico?.toLocaleString()})`);
      console.log(`     ✅ Mesma categoria: ${resultado.testes.mesmaCategoria} (${imovel.Categoria})`);
      console.log(`     🎯 PASSOU: ${resultado.passouNosFiltros ? 'SIM' : 'NÃO'}`);

      return resultado;
    });

    const aprovados = resultadosDetalhados.filter(r => r.passouNosFiltros);
    console.log(`\n📊 RESUMO:`);
    console.log(`  Total no mesmo empreendimento: ${todosDoMesmoEmpreendimento.length}`);
    console.log(`  Aprovados nos filtros: ${aprovados.length}`);

    // Busca normal para comparação
    const filtroOriginal = {
      Codigo: { $ne: id },
      Bairro: imovelReferencia.Bairro,
      AreaPrivativa: { $exists: true, $ne: "" },
      ValorAntigo: { $nin: ["0", ""] },
    };

    if (imovelReferencia.Categoria) {
      filtroOriginal.Categoria = imovelReferencia.Categoria;
    }

    const imoveisSimilares = await Imovel.find(filtroOriginal).limit(20).lean();
    
    console.log(`\n🔍 BUSCA ORIGINAL NO BAIRRO:`);
    console.log(`  Total encontrados: ${imoveisSimilares.length}`);

    // Retornar dados de debug junto com os similares
    return NextResponse.json({
      status: 200,
      data: aprovados, // Retornar apenas os aprovados para teste
      debug: {
        imovelReferencia: {
          Codigo: imovelReferencia.Codigo,
          Empreendimento: imovelReferencia.Empreendimento,
          Endereco: `${imovelReferencia.Endereco}, ${imovelReferencia.Numero}`,
          Bairro: imovelReferencia.Bairro,
          Categoria: imovelReferencia.Categoria,
          AreaPrivativa: imovelReferencia.AreaPrivativa,
          ValorAntigo: imovelReferencia.ValorAntigo
        },
        totais: {
          mesmoEmpreendimento: todosDoMesmoEmpreendimento.length,
          mesmoEndereco: todosDoMesmoEndereco.length,
          aprovadosNosfiltros: aprovados.length,
          buscaOriginalBairro: imoveisSimilares.length
        },
        filtrosAplicados: {
          areaMinima,
          areaMaxima,
          precoMinimo,
          precoMaximo,
          categoria: imovelReferencia.Categoria
        },
        detalhesDosTestes: resultadosDetalhados
      }
    });

  } catch (error) {
    console.error("Erro ao buscar imóveis similares:", error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
