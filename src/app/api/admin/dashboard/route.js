import { NextResponse } from "next/server";
import Imovel from "@/app/models/Imovel";
import ImovelAtivo from "@/app/models/ImovelAtivo";

import Review from "@/app/models/Review";
import { connectToDatabase } from "@/app/lib/mongodb";
import ImovelInativo from "@/app/models/ImovelInativo";
import Corretores from "@/app/models/Corretores";

export async function GET() {
  try {
    await connectToDatabase();

    const imoveis = await Imovel.countDocuments();
    const imoveisAtivos = await ImovelAtivo.countDocuments();
    const imoveisInativos = await ImovelInativo.countDocuments();
    const imoveisParaReview = await Review.countDocuments();

    const condominios = await Imovel.countDocuments({
      Condominio: "Sim",
    });

    return NextResponse.json({
      status: 200,
      data: {
        imoveis,
        imoveisAtivos,
        imoveisInativos,
        condominios,
        imoveisParaReview,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json({
      status: 500,
      message: "Erro ao buscar dados do dashboard",
    });
  }
}
