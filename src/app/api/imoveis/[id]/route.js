import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    console.log('📥 GET - Buscando imóvel:', id);
    
    // 🔥 CORRIGIDO: Buscar por Codigo primeiro, depois por _id
    let imovel;
    
    // Tentar buscar por Codigo primeiro (string normal)
    imovel = await Imovel.findOne({ Codigo: id });
    
    // Se não encontrou e o id parece ser um ObjectId, tentar por _id
    if (!imovel && id.match(/^[0-9a-fA-F]{24}$/)) {
      imovel = await Imovel.findById(id);
    }
    
    if (!imovel) {
      console.log('❌ GET - Imóvel não encontrado:', id);
      return NextResponse.json(
        { status: 404, message: "Imóvel não encontrado" },
        { status: 404 }
      );
    }
    
    console.log('✅ GET - Imóvel encontrado:', imovel.Codigo);
    
    return NextResponse.json({
      status: 200,
      data: imovel,
    });
  } catch (error) {
    console.error("❌ GET - Erro ao buscar imóvel:", error);
    return NextResponse.json(
      { status: 500, message: "Erro ao buscar imóvel", error: error.message },
      { status: 500 }
    );
  }
}

// 🔥 PUT CORRIGIDO PARA BUSCAR POR CODIGO
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();
    const dadosAtualizados = await request.json();
    
    console.group('📥 PUT - Processando atualização');
    console.log('ID/Código:', id);
    console.log('Dados recebidos:', {
      codigo: dadosAtualizados.Codigo,
      empreendimento: dadosAtualizados.Empreendimento,
      totalFotos: Array.isArray(dadosAtualizados.Foto) ? dadosAtualizados.Foto.length : 'Não é array',
      primeirasFotosOrdem: Array.isArray(dadosAtualizados.Foto) 
        ? dadosAtualizados.Foto.slice(0, 3).map(f => ({ codigo: f.Codigo, ordem: f.ordem }))
        : 'N/A'
    });

    // 🔥 CORRIGIDO: Buscar imóvel por Codigo primeiro, depois por _id
    let imovel;
    
    // Primeiro: tentar buscar por Codigo (campo personalizado)
    imovel = await Imovel.findOne({ Codigo: id });
    console.log('🔍 Busca por Codigo:', id, '→', imovel ? 'Encontrado' : 'Não encontrado');
    
    // Segundo: se não encontrou e parece ser ObjectId, tentar por _id
    if (!imovel && id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('🔍 Tentando busca por _id...');
      imovel = await Imovel.findById(id);
      console.log('🔍 Busca por _id:', imovel ? 'Encontrado' : 'Não encontrado');
    }

    if (!imovel) {
      console.log('❌ Imóvel não encontrado com ID:', id);
      console.groupEnd();
      return NextResponse.json(
        { status: 404, message: "Imóvel não encontrado", error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    console.log('✅ Imóvel encontrado:', imovel.Codigo, '(MongoDB _id:', imovel._id, ')');

    // 🔥 PROCESSAMENTO ESPECIAL PARA FOTOS COM VALIDAÇÃO
    if (dadosAtualizados.Foto && Array.isArray(dadosAtualizados.Foto)) {
      console.log('📸 Processando array de fotos...');
      
      // Validar e limpar dados das fotos
      const fotosLimpas = dadosAtualizados.Foto.map((foto, index) => {
        // Garantir que ordem seja número
        const ordemFinal = typeof foto.ordem === 'number' ? foto.ordem : index;
        
        const fotoLimpa = {
          ...foto,
          ordem: ordemFinal,
          Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
          Destaque: foto.Destaque || "Nao"
        };
        
        // Remover propriedades undefined/null
        Object.keys(fotoLimpa).forEach(key => {
          if (fotoLimpa[key] === undefined || fotoLimpa[key] === null) {
            delete fotoLimpa[key];
          }
        });
        
        return fotoLimpa;
      });
      
      // Ordenar pelas ordens para garantir consistência
      fotosLimpas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      
      console.log('📸 Fotos processadas:', {
        total: fotosLimpas.length,
        ordens: fotosLimpas.map(f => f.ordem),
        primeirasFotos: fotosLimpas.slice(0, 3).map(f => ({ 
          codigo: f.Codigo, 
          ordem: f.ordem,
          url: f.Foto?.substring(f.Foto.lastIndexOf('/') + 1, f.Foto.lastIndexOf('/') + 10) + '...'
        }))
      });
      
      dadosAtualizados.Foto = fotosLimpas;
    }

    // Atualizar campo por campo
    Object.keys(dadosAtualizados).forEach(key => {
      imovel[key] = dadosAtualizados[key];
    });

    // 🔥 CRÍTICO: Forçar MongoDB a detectar mudanças nos arrays
    if (dadosAtualizados.Foto) {
      imovel.markModified('Foto');
      console.log('🔄 Campo Foto marcado como modificado');
    }
    
    if (dadosAtualizados.Video) {
      imovel.markModified('Video');
      console.log('🔄 Campo Video marcado como modificado');
    }

    // Salvar com validação reduzida
    console.log('💾 Salvando no MongoDB...');
    const imovelAtualizado = await imovel.save({ 
      validateBeforeSave: false,
      timestamps: true 
    });

    console.log('✅ Imóvel salvo com sucesso no MongoDB');
    console.log('💾 Fotos finais no banco:', {
      total: Array.isArray(imovelAtualizado.Foto) ? imovelAtualizado.Foto.length : 'Não é array',
      primeirasFotosOrdem: Array.isArray(imovelAtualizado.Foto) 
        ? imovelAtualizado.Foto.slice(0, 3).map(f => ({ codigo: f.Codigo, ordem: f.ordem }))
        : 'N/A'
    });
    console.groupEnd();

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: {
        _id: imovelAtualizado._id,
        Codigo: imovelAtualizado.Codigo,
        Empreendimento: imovelAtualizado.Empreendimento,
        totalFotos: Array.isArray(imovelAtualizado.Foto) ? imovelAtualizado.Foto.length : 0
      },
    });

  } catch (error) {
    console.error('❌ PUT - Erro ao atualizar:', error);
    console.groupEnd();
    
    // Tratamento específico para erros do MongoDB
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          status: 400,
          success: false,
          message: "ID do imóvel inválido",
          error: `Formato de ID inválido: ${id}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Erro ao atualizar imóvel",
        error: error.message
      },
      { status: 500 }
    );
  }
}
