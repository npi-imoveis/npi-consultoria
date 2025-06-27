export default function Head({ searchParams }) {
  const { bairro, cidade, categoria, pagina } = searchParams || {};

  const bairroText = bairro ? ` no bairro ${Array.isArray(bairro) ? bairro.join(", ") : bairro}` : "";
  const cidadeText = cidade ? ` em ${cidade}` : "";
  const categoriaText = categoria ? ` de ${categoria}` : "";
  const paginaText = pagina ? ` - Página ${pagina}` : "";

  const title = `Busca de imóveis${categoriaText}${bairroText}${cidadeText} | NPi Imóveis${paginaText}`;
  const description = `Encontre imóveis${categoriaText}${bairroText}${cidadeText} com a NPi Imóveis. Imóveis de alto padrão, cuidadosamente selecionados para você${paginaText}.`;

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/busca${window?.location?.search || ""}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />
    </>
  );
}
