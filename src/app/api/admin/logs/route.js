import { connectToDatabase } from "@/app/lib/mongodb";
import Logs from "@/app/models/Logs";

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
    return NextResponse.json({});
  }
}
