import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    console.log('📥 GET - Buscando imóvel:', id);
    
    // Buscar por Codigo primeiro, depois por _id
    let imovel;
    
    imovel = await Imovel.findOne({ Codigo: id });
    
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

// 🔥 PUT CORRIGIDO COM TRATAMENTO DE CONCORRÊNCIA
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

    // 🔥 BUSCAR E ATUALIZAR COM RETRY PARA CONCORRÊNCIA
    let tentativas = 0;
    const maxTentativas = 3;
    let imovelAtualizado = null;

    while (tentativas < maxTentativas) {
      try {
        tentativas++;
        console.log(`🔄 Tentativa ${tentativas}/${maxTentativas}`);

        // Buscar imóvel mais recente
        let imovel;
        
        // Primeiro: tentar buscar por Codigo
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
        console.log('📊 Versão atual do documento:', imovel.__v);

        // 🔥 PROCESSAMENTO ESPECIAL PARA FOTOS COM VALIDAÇÃO
        if (dadosAtualizados.Foto && Array.isArray(dadosAtualizados.Foto)) {
          console.log('📸 Processando array de fotos...');
          
          const fotosLimpas = dadosAtualizados.Foto.map((foto, index) => {
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

        // 🔥 ATUALIZAÇÃO ATÔMICA COM findOneAndUpdate (EVITA CONCORRÊNCIA)
        const imovelAtualizadoResult = await Imovel.findOneAndUpdate(
          { 
            _id: imovel._id,
            __v: imovel.__v // Verificação de versão para evitar conflitos
          },
          {
            $set: dadosAtualizados,
            $inc: { __v: 1 } // Incrementar versão
          },
          {
            new: true, // Retornar documento atualizado
            runValidators: false,
            useFindAndModify: false
          }
        );

        if (!imovelAtualizadoResult) {
          throw new Error('Documento foi modificado por outra operação (conflito de versão)');
        }

        imovelAtualizado = imovelAtualizadoResult;
        console.log('✅ Imóvel atualizado com sucesso (versão:', imovelAtualizado.__v, ')');
        break; // Sair do loop se sucesso

      } catch (error) {
        console.warn(`⚠️ Tentativa ${tentativas} falhou:`, error.message);
        
        if (tentativas >= maxTentativas) {
          throw error; // Re-throw se esgotar tentativas
        }
        
        // Aguardar um pouco antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 100 * tentativas));
      }
    }

    if (!imovelAtualizado) {
      throw new Error('Falha ao atualizar após múltiplas tentativas');
    }

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
        totalFotos: Array.isArray(imovelAtualizado.Foto) ? imovelAtualizado.Foto.length : 0,
        versao: imovelAtualizado.__v
      },
    });

  } catch (error) {
    console.error('❌ PUT - Erro ao atualizar:', error);
    console.groupEnd();
    
    // Tratamento específico para diferentes tipos de erro
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
    
    if (error.name === 'VersionError' || error.message.includes('version') || error.message.includes('conflito')) {
      return NextResponse.json(
        {
          status: 409,
          success: false,
          message: "Conflito de versão. O imóvel foi modificado por outra operação. Tente novamente.",
          error: "Conflito de concorrência"
        },
        { status: 409 }
      );
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          status: 400,
          success: false,
          message: "Dados inválidos",
          error: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Erro interno do servidor",
        error: error.message
      },
      { status: 500 }
    );
  }
}
