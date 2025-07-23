import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    // Tentar buscar por Codigo primeiro, depois por _id
    let imovel = await Imovel.findOne({ Codigo: id });
    if (!imovel) {
      imovel = await Imovel.findById(id);
    }
    
    if (!imovel) {
      return NextResponse.json(
        { status: 404, message: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      data: imovel,
    });
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
    return NextResponse.json(
      { status: 500, message: "Erro ao buscar imóvel", error: error.message },
      { status: 500 }
    );
  }
}

// 🔥 PUT OTIMIZADO PARA SALVAR ORDEM DAS FOTOS
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();
    const dadosAtualizados = await request.json();
    
    console.group('📥 ADMIN API PUT - Processando atualização');
    console.log('ID/Código:', id);
    console.log('Dados recebidos:', {
      codigo: dadosAtualizados.Codigo,
      totalFotos: Array.isArray(dadosAtualizados.Foto) ? dadosAtualizados.Foto.length : 'Não é array',
      primeirasFotosOrdem: Array.isArray(dadosAtualizados.Foto) 
        ? dadosAtualizados.Foto.slice(0, 3).map(f => ({ codigo: f.Codigo, ordem: f.ordem }))
        : 'N/A'
    });

    // Buscar imóvel existente
    let imovel = await Imovel.findOne({ Codigo: id });
    if (!imovel) {
      imovel = await Imovel.findById(id);
    }

    if (!imovel) {
      console.log('❌ Imóvel não encontrado');
      console.groupEnd();
      return NextResponse.json(
        { status: 404, message: "Imóvel não encontrado", error: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    console.log('✅ Imóvel encontrado:', imovel.Codigo);

    // 🔥 PROCESSAMENTO ESPECIAL PARA FOTOS
    if (dadosAtualizados.Foto && Array.isArray(dadosAtualizados.Foto)) {
      console.log('📸 Processando array de fotos...');
      
      // Validar e limpar dados das fotos
      const fotosLimpas = dadosAtualizados.Foto.map((foto, index) => {
        const fotoLimpa = {
          ...foto,
          ordem: typeof foto.ordem === 'number' ? foto.ordem : index,
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
    const imovelAtualizado = await imovel.save({ 
      validateBeforeSave: false,
      timestamps: true 
    });

    console.log('✅ Imóvel salvo com sucesso');
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
    console.error('❌ ADMIN API PUT - Erro:', error);
    console.groupEnd();
    
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
