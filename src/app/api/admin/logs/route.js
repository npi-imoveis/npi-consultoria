import { connectToDatabase } from "@/app/lib/mongodb";
import Logs from "@/app/models/Logs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectToDatabase();

    const dadosLog = await request.json();

    const novoLog = new Logs(dadosLog);
    const logSalvo = await novoLog.save();

    return NextResponse.json(
      {
        status: 201,
        success: true,
        message: "Log salvo com sucesso",
        data: logSalvo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao salvar log:", error);
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    const logs = await Logs.find().sort({ _id: -1 });

    return NextResponse.json({
      status: 200,
      data: logs,
    });
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
  }
}
