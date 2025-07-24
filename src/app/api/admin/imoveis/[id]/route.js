import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

// 🔥 VERSÃO DA API ROUTE COM LOGS DETALHADOS PARA DEBUG
// Substitua o método PUT da sua API route por esta versão:

export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();
    const dadosAtualizados = await request.json();
    
    console.group('📥 API PUT - Recebendo requisição de atualização');
    console.log('🆔 ID/Código recebido:', id);
    console.log('📊 Dados recebidos:', {
      codigo: dadosAtualizados.Codigo,
      empreendimento: dadosAtualizados.Empreendimento,
      totalCampos: Object.keys(dadosAtualizados).length,
      temFotos: !!dadosAtualizados.Foto,
      totalFotos: Array.isArray(dadosAtualizados.Foto) ? dadosAtualizados.Foto.length : 'Não array'
    });

    // 🔥 VALIDAÇÃO INICIAL
    if (!id) {
      console.error('❌ ID não fornecido');
      console.groupEnd();
      return NextResponse.json(
        { status: 400, message: "ID do imóvel é obrigatório" },
        { status: 400 }
      );
    }

    // 🔍 LOG DETALHADO DAS FOTOS RECEBIDAS
    if (dadosAtualizados.Foto && Array.isArray(dadosAtualizados.Foto)) {
      console.log('📸 Análise das fotos recebidas:');
      console.log('  - Total de fotos:', dadosAtualizados.Foto.length);
      
      const ordens = dadosAtualizados.Foto.map(f => f.Ordem);
      console.log('  - Sequência de ordens recebidas:', ordens.join(','));
      
      // Verificar primeiras e últimas fotos
      console.log('  - Primeiras 3 fotos:');
      dadosAtualizados.Foto.slice(0, 3).forEach((foto, index) => {
        console.log(`    ${index + 1}. Código: ${foto.Codigo}, Ordem: ${foto.Ordem}`);
      });
      
      console.log('  - Últimas 3 fotos:');
      dadosAtualizados.Foto.slice(-3).forEach((foto, index) => {
        const posicao = dadosAtualizados.Foto.length - 3 + index + 1;
        console.log(`    ${posicao}. Código: ${foto.Codigo}, Ordem: ${foto.Ordem}`);
      });
      
      // Detectar problemas
      const ordensValidas = ordens.every(o => typeof o === 'number' && o >= 0);
      const ordensUnicas = [...new Set(ordens)];
      const temDuplicadas = ordens.length !== ordensUnicas.length;
      
      console.log('  - Ordens válidas?', ordensValidas);
      console.log('  - Tem duplicadas?', temDuplicadas);
      
      if (!ordensValidas) {
        console.warn('⚠️ PROBLEMA: Ordens inválidas detectadas!');
      }
      if (temDuplicadas) {
        console.warn('⚠️ PROBLEMA: Ordens duplicadas detectadas!');
      }
    }

    // 🔍 BUSCA DO IMÓVEL
    let imovel;
    
    console.log('🔍 Buscando imóvel por Codigo:', id);
    imovel = await Imovel.findOne({ Codigo: id });
    
    if (imovel) {
      console.log('✅ Imóvel encontrado por Codigo:', imovel.Codigo);
    } else {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('🔍 Tentando busca por _id MongoDB...');
        imovel = await Imovel.findById(id);
        
        if (imovel) {
          console.log('✅ Imóvel encontrado por _id:', imovel._id);
        }
      }
    }

    if (!imovel) {
      console.error('❌ Imóvel não encontrado com ID:', id);
      console.groupEnd();
      return NextResponse.json(
        { status: 404, message: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    console.log('📋 Imóvel atual no banco:');
    console.log('  - Código:', imovel.Codigo);
    console.log('  - Empreendimento:', imovel.Empreendimento);
    console.log('  - Total de fotos atuais:', Array.isArray(imovel.Foto) ? imovel.Foto.length : 'Não array');

    // 🔥 PROCESSAMENTO CRÍTICO PARA FOTOS - PRESERVAR ORDEM EXATA
    if (dadosAtualizados.Foto && Array.isArray(dadosAtualizados.Foto)) {
      console.log('📸 Processando fotos - PRESERVANDO ORDEM EXATA...');
      
      // 🚀 CRÍTICO: NÃO REORDENAR - PRESERVAR ORDEM EXATA ENVIADA
      const fotosProcessadas = dadosAtualizados.Foto.map((foto, index) => {
        // Garantir que Ordem seja número válido
        let ordemFinal = foto.Ordem;
        
        if (typeof ordemFinal !== 'number' || ordemFinal < 0) {
          console.warn(`⚠️ Foto ${index} tem ordem inválida (${ordemFinal}), usando índice (${index})`);
          ordemFinal = index;
        }
        
        // Criar objeto limpo da foto
        const fotoProcessada = {
          Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
          Foto: foto.Foto || '',
          Destaque: foto.Destaque || "Nao",
          Ordem: ordemFinal, // ← PRESERVAR ORDEM EXATA
          tipoOrdenacao: foto.tipoOrdenacao || 'manual'
        };
        
        // Preservar outros campos se existirem
        if (foto._id && foto._id !== 'undefined') fotoProcessada._id = foto._id;
        if (foto.Descricao) fotoProcessada.Descricao = foto.Descricao;
        if (foto.Alt) fotoProcessada.Alt = foto.Alt;
        
        return fotoProcessada;
      });
      
      // 🔍 LOG FINAL DAS FOTOS PROCESSADAS
      console.log('📸 Fotos processadas para salvar:');
      console.log('  - Total:', fotosProcessadas.length);
      console.log('  - Sequência final de ordens:', fotosProcessadas.map(f => f.Ordem).join(','));
      
      // Verificar se a ordem foi preservada
      const ordensOriginais = dadosAtualizados.Foto.map(f => f.Ordem);
      const ordensProcessadas = fotosProcessadas.map(f => f.Ordem);
      const ordemPreservada = JSON.stringify(ordensOriginais) === JSON.stringify(ordensProcessadas);
      
      console.log('🔍 Ordem foi preservada durante processamento?', ordemPreservada);
      
      if (!ordemPreservada) {
        console.warn('⚠️ PROBLEMA: Ordem não foi preservada durante processamento!');
        console.log('  - Ordens originais:', ordensOriginais.join(','));
        console.log('  - Ordens processadas:', ordensProcessadas.join(','));
      }
      
      dadosAtualizados.Foto = fotosProcessadas;
    }

    // 🔥 LIMPEZA GERAL DOS DADOS
    console.log('🧹 Limpando dados para atualização...');
    
    // Remover campos que podem causar conflito
    const camposParaRemover = ['_id', '__v', 'createdAt', 'updatedAt'];
    camposParaRemover.forEach(campo => {
      if (dadosAtualizados[campo]) {
        delete dadosAtualizados[campo];
      }
    });

    // 📝 ATUALIZAÇÃO DO DOCUMENTO
    console.log('📝 Atualizando documento no MongoDB...');
    
    // Atualizar cada campo individualmente
    Object.keys(dadosAtualizados).forEach(key => {
      if (dadosAtualizados[key] !== undefined) {
        imovel[key] = dadosAtualizados[key];
      }
    });

    // 🔥 MARCAR CAMPOS MODIFICADOS (CRÍTICO PARA ARRAYS)
    if (dadosAtualizados.Foto) {
      imovel.markModified('Foto');
      console.log('🔄 Campo Foto marcado como modificado');
    }

    // 💾 SALVAMENTO NO MONGODB
    console.log('💾 Tentando salvar no MongoDB...');
    
    const imovelAtualizado = await imovel.save({ 
      validateBeforeSave: false
    });

    console.log('✅ Documento salvo com sucesso!');

    // 📸 VERIFICAÇÃO FINAL DAS FOTOS SALVAS
    if (Array.isArray(imovelAtualizado.Foto) && imovelAtualizado.Foto.length > 0) {
      console.log('📸 VERIFICAÇÃO FINAL - Fotos salvas no banco:');
      console.log('  - Total salvo:', imovelAtualizado.Foto.length);
      console.log('  - Sequência de ordens salvas:', imovelAtualizado.Foto.map(f => f.Ordem).join(','));
      
      // 🔍 VERIFICAÇÃO DETALHADA DAS PRIMEIRAS E ÚLTIMAS FOTOS
      console.log('📋 Detalhes das fotos salvas no banco:');
      imovelAtualizado.Foto.slice(0, 3).forEach((foto, index) => {
        console.log(`  Primeira ${index + 1}: Código ${foto.Codigo}, Ordem: ${foto.Ordem}, Destaque: ${foto.Destaque}`);
      });
      imovelAtualizado.Foto.slice(-3).forEach((foto, index) => {
        const pos = imovelAtualizado.Foto.length - 3 + index + 1;
        console.log(`  Última ${pos}: Código ${foto.Codigo}, Ordem: ${foto.Ordem}, Destaque: ${foto.Destaque}`);
      });
      
      // 🔍 VERIFICAR ESTRUTURA COMPLETA DE UMA FOTO
      const fotoExemplo = imovelAtualizado.Foto[0];
      console.log('📊 Estrutura completa da primeira foto salva:', {
        keys: Object.keys(fotoExemplo),
        Codigo: fotoExemplo.Codigo,
        Ordem: fotoExemplo.Ordem,
        tipoOrdem: typeof fotoExemplo.Ordem,
        outrosCampos: Object.keys(fotoExemplo).filter(k => !['Codigo', 'Foto', 'Destaque', 'Ordem'].includes(k))
      });
      
      // Verificar se ordem foi preservada até o final
      if (dadosAtualizados.Foto) {
        const ordensEnviadas = dadosAtualizados.Foto.map(f => f.Ordem);
        const ordensSalvas = imovelAtualizado.Foto.map(f => f.Ordem);
        const ordemFinalPreservada = JSON.stringify(ordensEnviadas) === JSON.stringify(ordensSalvas);
        
        console.log('🔍 Ordem foi preservada até o banco?', ordemFinalPreservada);
        
        if (!ordemFinalPreservada) {
          console.error('❌ PROBLEMA CRÍTICO: Ordem não foi preservada no banco!');
          console.log('  - Ordens enviadas:', ordensEnviadas.join(','));
          console.log('  - Ordens salvas:', ordensSalvas.join(','));
        } else {
          console.log('✅ SUCESSO: Ordem preservada com sucesso até o banco!');
        }
      }
    }

    console.groupEnd();

    // 🎉 RESPOSTA DE SUCESSO
    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: {
        _id: imovelAtualizado._id,
        Codigo: imovelAtualizado.Codigo,
        Empreendimento: imovelAtualizado.Empreendimento,
        totalFotos: Array.isArray(imovelAtualizado.Foto) ? imovelAtualizado.Foto.length : 0,
        ultimaAtualizacao: new Date().toISOString()
      },
    });

  } catch (error) {
    console.error('❌ API PUT - Erro geral:', error);
    console.groupEnd();
    
    // Log detalhado do erro
    console.error('📊 Detalhes do erro na API:');
    console.error('  - Nome:', error.name);
    console.error('  - Mensagem:', error.message);
    console.error('  - Stack:', error.stack);
    
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Erro interno do servidor",
        error: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
