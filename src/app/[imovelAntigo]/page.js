   export const dynamic = "force-dynamic";

   import { redirect, notFound } from "next/navigation";
   import { getImovelById } from "@/app/services";

   export default async function Page({ params }) {
     const { imovelAntigo } = params;
     if (!imovelAntigo || typeof imovelAntigo !== "string") return notFound();
     const match = imovelAntigo.match(/^imovel-(\\d+)$/);
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
