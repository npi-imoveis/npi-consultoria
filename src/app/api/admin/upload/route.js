import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const directory = formData.get("directory") || "uploads";
  const filename = formData.get("filename") || `${Date.now()}-${file.name}`;

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  // Validação (já feita no frontend, mas pode reforçar)
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Apenas arquivos de imagem são permitidos" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Tamanho máximo é 5MB" }, { status: 400 });
  }

  // Simulação de upload (substitua por lógica real, ex.: Vercel Blob ou filesystem)
  const url = `/${directory}/${filename}`; // Ajuste para o armazenamento real
  return NextResponse.json({ url, message: "Upload bem-sucedido" }, { status: 200 });
}

// Bloqueia outros métodos para evitar 405
export function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 });
}
export function PUT() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 });
}
