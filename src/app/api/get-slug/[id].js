export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do imóvel é obrigatório." });
  }

  try {
    // Simula a busca dos dados do imóvel (substitua pelo código real)
    // <Adicionar sua lógica para consultar o banco ou CMS>
    const imovel = {
      Codigo: id,
      Empreendimento: "Avenida Antônio Joaquim de Moura Andrade 597",
      Slug: "avenida-antonio-joaquim-de-moura-andrade-597",
    };

    if (!imovel) {
      return res.status(404).json({ error: "Imóvel não encontrado." });
    }

    // Retorna apenas o slug
    return res.status(200).json({ slug: imovel.Slug });
  } catch (error) {
    console.error("Erro ao buscar o slug:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}
