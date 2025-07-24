// app/api/admin/imoveis/[id]/route.ts
import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();
    const dadosAtualizados = await request.json();
    
    console.log('📥 API PUT - Atualizando imóvel:', id);

    // Buscar imóvel
    let imovel = await Imovel.findOne({ Codigo: id }) || await Imovel.findById(id);
    
    if (!imovel) {
      return NextResponse.json(
        { success: false, message: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // 🔥 PROCESSAR FOTOS - PRESERVAR ORDEM EXATA
    if (dadosAtualizados.Foto && Array.isArray(dadosAtualizados.Foto)) {
      console.log('📸 Processando', dadosAtualizados.Foto.length, 'fotos');
      
      const fotosProcessadas = dadosAtualizados.Foto.map((foto, index) => ({
        Codigo: foto.Codigo || `photo-${Date.now()}-${index}`,
        Foto: foto.Foto || '',
        Destaque: foto.Destaque || "Nao",
        Ordem: typeof foto.Ordem === 'number' ? foto.Ordem : index,
        tipoOrdenacao: foto.tipoOrdenacao || 'manual',
        ...(foto._id && foto._id !== 'undefined' && { _id: foto._id }),
        ...(foto.Descricao && { Descricao: foto.Descricao }),
        ...(foto.Alt && { Alt: foto.Alt })
      }));
      
      // Log da ordem final
      console.log('📊 Ordens finais:', fotosProcessadas.map(f => f.Ordem).join(','));
      dadosAtualizados.Foto = fotosProcessadas;
    }

    // Remover campos de sistema
    const { _id, __v, createdAt, updatedAt, ...dadosLimpos } = dadosAtualizados;

    // 🔥 ATUALIZAÇÃO E SALVAMENTO
    Object.keys(dadosLimpos).forEach(key => {
      if (dadosLimpos[key] !== undefined) {
        imovel[key] = dadosLimpos[key];
      }
    });

    // Marcar como modificado para arrays
    if (dadosLimpos.Foto) {
      imovel.markModified('Foto');
    }

    // Salvar
    const imovelAtualizado = await imovel.save({ validateBeforeSave: false });

    // 🎉 RESPOSTA COM DADOS COMPLETOS ATUALIZADOS
    const dadosCompletos = imovelAtualizado.toObject();
    
    console.log('✅ Imóvel atualizado. Total fotos salvas:', dadosCompletos.Foto?.length);

    return NextResponse.json({
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: dadosCompletos, // ← DADOS COMPLETOS ATUALIZADOS
      metadata: {
        _id: dadosCompletos._id,
        Codigo: dadosCompletos.Codigo,
        totalFotos: Array.isArray(dadosCompletos.Foto) ? dadosCompletos.Foto.length : 0,
        ultimaAtualizacao: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro na API PUT:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
        error: error.message
      },
      { status: 500 }
    );
  }
}

// 🔥 ADICIONAR MÉTODO GET OTIMIZADO
export async function GET(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();

    let imovel = await Imovel.findOne({ Codigo: id }).lean();
    
    if (!imovel && id.match(/^[0-9a-fA-F]{24}$/)) {
      imovel = await Imovel.findById(id).lean();
    }

    if (!imovel) {
      return NextResponse.json(
        { success: false, message: "Imóvel não encontrado" },
        { status: 404 }
      );
    }

    // Garantir que fotos tenham ordem consistente
    if (Array.isArray(imovel.Foto)) {
      imovel.Foto.sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
    }

    return NextResponse.json({
      success: true,
      data: imovel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na API GET:', error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar imóvel", error: error.message },
      { status: 500 }
    );
  }
}
