// pages/api/get-slug/[id].js

// Importe a mesma função de serviço que a sua página de imóvel usa
import { getImovelById } from '@/app/services'; // ⬅️ Verifique se este caminho está correto!

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID do imóvel é obrigatório.' });
  }

  try {
    // Utilize a função que JÁ FUNCIONA para buscar o imóvel
    const response = await getImovelById(id);

    // Se a função não retornar dados ou o slug estiver vazio
    if (!response?.data || !response.data.Slug) {
      // Retorna 404, pois o imóvel não foi encontrado ou não tem slug
      return res.status(404).json({ error: 'Imóvel não encontrado ou sem slug.' });
    }

    const slug = response.data.Slug;

    // Retorna o slug com sucesso
    return res.status(200).json({ slug });

  } catch (error) {
    console.error(`Erro ao processar a API get-slug para o ID ${id}:`, error);
    return res.status(500).json({ error: 'Erro interno do servidor ao buscar o slug.' });
  }
}
