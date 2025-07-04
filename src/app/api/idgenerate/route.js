import { connectToDatabase } from "../../lib/mongodb";
import Imovel from "../../models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const codigo = searchParams.get("codigo");
  if (!codigo) {
    return NextResponse.json({ error: "Código não informado" }, { status: 400 });
  }
  await connectToDatabase();
  const exists = await Imovel.exists({ Codigo: codigo });
  return NextResponse.json({ exists: !!exists });
}
