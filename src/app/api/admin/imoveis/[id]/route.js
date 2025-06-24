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
  
