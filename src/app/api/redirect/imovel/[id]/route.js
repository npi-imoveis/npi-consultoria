import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { redirect } from "next/navigation";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    await connectToDatabase();

    // Buscar o imóvel pelo código
    const imovel = await Imovel.findOne({ Codigo: id });

    if (!imovel) {
      // Se não encontrar o imóvel, redireciona para a página de busca
      return redirect('/busca');
    }

    // Gerar slug baseado no nome do empreendimento
    const slugBasico = imovel.Slug || 
      (imovel.Empreendimento 
        ? imovel.Empreendimento
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplos
            .replace(/^-|-$/g, '') // Remove hífens do início e fim
        : `imovel-${id}`);

    // Redirecionar para a URL com slug
    return redirect(`/imovel-${id}/${slugBasico}`);

  } catch (error) {
    console.error('Erro ao buscar imóvel para redirecionamento:', error);
    // Em caso de erro, redireciona para slug genérico
    return redirect(`/imovel-${id}/imovel-${id}`);
  }
}