import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    const imovel = await Imovel.findOne({ Codigo: id });
    
    if (!imovel) {
      return NextResponse.json(
        {
          status: 404,
          message: "Imóvel não encontrado",
        },
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
      {
        status: 500,
        message: "Erro ao buscar imóvel",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// 🔥 NOVA FUNÇÃO PUT PARA SALVAR ALTERAÇÕES
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();

    const dadosAtualizados = await request.json();

    console.log('📥 ADMIN API PUT - Atualizando imóvel:', id);
    console.log('📥 Fotos recebidas:', Array.isArray(dadosAtualizados.Foto) ? 
      `Array com ${dadosAtualizados.Foto.length} fotos` : 'Não é array');

    // Buscar imóvel existente
    let imovel = await Imovel.findOne({ Codigo: id });
    
    if (!imovel) {
      // Tentar buscar por _id se não encontrar por Codigo
      imovel = await Imovel.findById(id);
    }
    
    if (!imovel) {
      return NextResponse.json(
        {
          status: 404,
          message: "Imóvel não encontrado",
          error: "Imóvel não encontrado"
        },
        { status: 404 }
      );
    }

    // Atualizar campo por campo
    Object.keys(dadosAtualizados).forEach(key => {
      imovel[key] = dadosAtualizados[key];
    });

    // 🔥 CRÍTICO: Forçar MongoDB a detectar mudanças no campo Foto
    imovel.markModified('Foto');
    
    // Salvar com validação desabilitada para garantir
    const imovelAtualizado = await imovel.save({ validateBeforeSave: false });

    console.log('✅ ADMIN API: Imóvel atualizado com sucesso');
    console.log('💾 Fotos salvas:', Array.isArray(imovelAtualizado.Foto) ? 
      `Array com ${imovelAtualizado.Foto.length} fotos` : 'Objeto');

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: imovelAtualizado,
    });
    
  } catch (error) {
    console.error('❌ ADMIN API PUT - Erro:', error);
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
