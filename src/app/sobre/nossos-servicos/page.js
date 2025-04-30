import { HeaderPage } from "@/app/components/ui/header-page";
import getContent from "@/app/lib/get-content";

import { BriefcaseBusinessIcon } from "lucide-react";

export default async function ServicesPage() {
  const content = await getContent();

  return (
    <section>
      <HeaderPage
        title="Conheça nossos serviços	"
        description="Oferecemos uma ampla gama de serviços para atender às necessidades de nossos clientes."
        image="/assets/images/imoveis/02.jpg"
      />
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content?.servicos?.map((servico, index) => (
            <div
              key={index}
              className=" bg-zinc-50 p-9 space-y-3 relative overflow-hidden rounded-lg"
            >
              <BriefcaseBusinessIcon className="w-6 h-6" />
              <h1 className="font-bold text-sm">{servico.title}</h1>
              <p className="text-sm text-zinc-900 leading-6">{servico.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
