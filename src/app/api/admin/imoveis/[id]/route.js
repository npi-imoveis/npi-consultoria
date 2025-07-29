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

// ✅ ADICIONE ESTA FUNÇÃO PUT
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    
    console.log('🔄 PUT API chamada:', { id, body });
    console.log('🎥 Video recebido na API:', body.Video);

    // Buscar o imóvel existente
    const imovelExistente = await Imovel.findOne({ Codigo: id });
    
    if (!imovelExistente) {
      console.log('❌ Imóvel não encontrado:', id);
      return NextResponse.json(
        {
          status: 404,
          message: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    // Atualizar o imóvel com os novos dados
    const imovelAtualizado = await Imovel.findOneAndUpdate(
      { Codigo: id },
      { 
        ...body,
        // Garantir que o Video seja salvo corretamente
        Video: body.Video || {}
      },
      { 
        new: true, // Retornar o documento atualizado
        runValidators: true // Executar validações
      }
    );

    console.log('✅ Imóvel atualizado:', imovelAtualizado.Codigo);
    console.log('✅ Video salvo:', imovelAtualizado.Video);

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: imovelAtualizado,
    });

  } catch (error) {
    console.error("❌ Erro ao atualizar imóvel:", error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        message: "Erro ao atualizar imóvel",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
