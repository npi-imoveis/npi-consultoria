// -----------------------------------------------------------------------------
// Esta página dinâmica intercepta acessos a /imovel-:id (sem slug)
// Busca o imóvel pelo id, obtém o slug correto e redireciona para a URL canônica
// Isso garante que acessos sem slug não caiam em 404 e melhora o SEO
// -----------------------------------------------------------------------------

import { notFound, redirect } from "next/navigation";

export default async function RedirectImovel({ params }) {
  const { id } = params;

  // Busca o imóvel pelo id na API interna
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/imoveis/${id}`, {
    // Garante que o fetch seja feito no servidor
    cache: "no-store",
  });

  if (!res.ok) {
    // Se não encontrar, retorna 404
    notFound();
  }

  const data = await res.json();
  const slug = data?.data?.Slug;

  if (!slug) {
    notFound();
  }

  // Redireciona para a URL canônica
  redirect(`/imovel-${id}/${slug}`);
}
