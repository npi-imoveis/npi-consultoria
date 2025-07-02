export const dynamic = "force-dynamic";
// Este arquivo captura URLs antigas do tipo /imovel-123 (sem slug) e redireciona dinamicamente para a URL canônica /imovel-123/slug-do-imovel.
// Isso garante que acessos antigos vindos do Google ou outros sites sejam corretamente redirecionados, resolvendo problemas de SEO e evitando 404.
// Não remova este arquivo! Ele é fundamental para o roteamento dinâmico do Next.js quando existe a rota /imovel/[id]/[slug].

// src/app/imovel-[id]/page.js

// ...comentário...

import { redirect, notFound } from "next/navigation";
import { getImovelById } from "@/app/services";

export default async function Page({ params }) {
  // O Next.js envia o parâmetro como "imovel-123"
  const { id } = params;
  if (!id || typeof id !== "string") return notFound();
  const match = id.match(/^imovel-(\d+)$/);
  if (!match) return notFound();
  const imovelId = match[1];
  try {
    const response = await getImovelById(imovelId);
    const imovel = response?.data;
    if (imovel && imovel.Slug) {
      redirect(`/imovel-${imovelId}/${imovel.Slug}`);
    } else {
      notFound();
    }
  } catch {
    notFound();
  }
}
