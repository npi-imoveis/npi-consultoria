import { HeaderPage } from "@/app/components/ui/header-page";

import { GlobeAltIcon, BuildingOfficeIcon, ChartBarIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentListIcon, HomeIcon, KeyIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { HandshakeIcon } from "lucide-react";



export default function ServicesPage() {
  const servicos = [
    {
      id: 0,
      titulo: "Parceria com imobiliarias de alto padrão",
      descricao: "Atravé do nosso hub nós conectamos clientes de high ticket qualificaos as imobiliarias parceiras",
      icone: <BuildingOfficeIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 1,
      titulo: "Posicionamento dos imóveis no Google",
      descricao: "Somos especialista no posicionamento orgânico, o que nos dá a melhor visibilidade para os imóveis no maior buscador do mundo",
      icone: <GlobeAltIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 2,
      titulo: "Venda direta com construtoras",
      descricao: "Venda direta com as melhores construtoras de São Paulo",
      icone: <BuildingOfficeIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 3,
      titulo: "Imóveis residenciais e comerciais",
      descricao: "Imóveis residenciais e comerciais, no pré-lançamento, no lançamento, em construção e prontos novos com até 10 anos",
      icone: <HomeIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 4,
      titulo: "Locação comercial",
      descricao: "Locação de salas comerciais e lajes corporativas para pequenas, médias e grandes empresas",
      icone: <KeyIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 5,
      titulo: "Atendimento personalizado",
      descricao: "Atendimento totalmente personalizado",
      icone: <UserGroupIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 6,
      titulo: "Parceria com corretores",
      descricao: "Parceria com corretores de outras imobiliárias",
      icone: <HandshakeIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 7,
      titulo: "Negociação especializada",
      descricao: "Negociadores experientes para tratar propostas com a diretoria da construtora e cliente final",
      icone: <ChatBubbleBottomCenterTextIcon className="h-12 w-12 text-[#8B6F48]" />
    },
    {
      id: 8,
      titulo: "Consultoria para investidores",
      descricao: "Atendimento personalizado para investidores com consultoria especializada em investimentos imobiliários",
      icone: <ChartBarIcon className="h-12 w-12 text-[#8B6F48]" />
    },

  ];


  return (
    <section>
      <HeaderPage
        title="Conheça nossos serviços	"
        description="Oferecemos uma ampla gama de serviços para atender às necessidades de nossos clientes."
        image="/assets/images/imoveis/02.jpg"
      />
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* <TitleSection
          center
          section="Novidades"
          title="Outros produtos de luxo"
          description="Os melhores produtos de alto luxo reunidos em um só lugar. Em breve, além dos imóveis mais exclusivo."
        /> */}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico) => (
            <div
              key={servico.id}
              className=" bg-zinc-50 p-9 space-y-3 relative overflow-hidden rounded-lg"
            >

              {servico.icone}
              <h1 className="font-bold text-sm">{servico.titulo}</h1>
              <p className="text-sm text-zinc-900 leading-6">
                {servico.descricao}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
