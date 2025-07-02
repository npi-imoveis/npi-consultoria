// src/app/imovel-[id]/page.js

// Esta página intercepta acessos a /imovel-123 (sem slug) e redireciona para a URL canônica com slug.
// Isso é fundamental para SEO, pois garante que acessos antigos ou indexados incorretamente sejam corrigidos.

import { redirect } from "next/navigation";
import { getImovelById } from "@/app/services";

export default async function ImovelIdPage({ params }) {
  // Extrai o id da URL (ex: /imovel-123)
  const idMatch = params?.id?.match(/^imovel-(\\d+)$/) || [];
  const id = idMatch[1];

  if (!id) {
    // Se não encontrar o id, retorna 404
    return redirect("/");
  }

  // Busca o imóvel pelo id
  const response = await getImovelById(id);
  const imovel = response?.data;

  if (!imovel || !imovel.Slug) {
    // Se não encontrar o imóvel, retorna 404
    return redirect("/");
  }

  // Redireciona para a URL canônica com slug
  redirect(`/imovel-${id}/${imovel.Slug}`);
}
