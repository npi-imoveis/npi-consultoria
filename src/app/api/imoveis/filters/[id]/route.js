import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    await connectToDatabase();

    const imovel = await Imovel.distinct(id);

    return NextResponse.json({
      status: 200,
      data: imovel,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
