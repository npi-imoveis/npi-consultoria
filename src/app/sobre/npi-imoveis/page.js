
import { HeaderPage } from "@/app/components/ui/header-page";
import SobreNPI from "./sections/SobreNpi";

import { HistoriaNpi } from "./sections/HistoriaNpi";
import VideoNpi from "./sections/VideoNpi";

export default async function SobrePage() {
  return (
    <section>
      <HeaderPage
        title="Saiba mais sobre a NPi Imóveis"
        description="Com os empreendedores Eduardo Lima e Aline Monteiro de Barros, a ideia inicial era para suprir algumas lacunas de uma mercado imobiliário em plena expansão."
        image="/assets/images/imoveis/02.jpg"
      />
      <SobreNPI />
      <HistoriaNpi />
      <VideoNpi />
    </section>
  );
}
