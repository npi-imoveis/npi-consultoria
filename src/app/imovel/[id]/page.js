// app/imovel/[id]/page.js
import { getImovelById } from "@/app/services";
import { redirect } from "next/navigation";

export default async function ImovelRedirect({ params }) {
  const { id } = params;
  
  try {
    const response = await getImovelById(id);
    
    if (!response?.data) {
      return redirect('/404');
    }
    
    const imovel = response.data;
    const slugCorreto = imovel.Slug;
    
    // Redireciona para a URL completa com slug
    redirect(`/imovel-${id}/${slugCorreto}`);
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
    return redirect('/404');
  }
}
