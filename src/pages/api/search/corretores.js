import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: 405, error: "Method not allowed" });
  }

  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(200).json({
        status: 200,
        data: [],
      });
    }

    await connectToDatabase();

    const resultado = await Corretores.aggregate([
      {
        $search: {
          index: "corretores",
          text: {
            query: q,
            path: ["nome", "nomeCompleto", "email", "celular"],
          },
        },
      },
      {
        $limit: 20,
      },
    ]);

    return res.status(200).json({
      status: 200,
      data: resultado,
    });
  } catch (error) {
    console.error("Erro na busca:", error);
    return res.status(500).json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
