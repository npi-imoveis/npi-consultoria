import { HeaderPage } from "@/app/components/ui/header-page";
import SobreNPI from "./sections/SobreNpi";
import { getContentSite } from "@/app/services";
import { HistoriaNpi } from "./sections/HistoriaNpi";
import VideoNpi from "./sections/VideoNpi";

export const metadata = {
  title: "NPi Imóveis - Sobre NPi Imóveis",
  description: "Conheça a NPi Imóveis",
};

export default async function SobrePage() {
  const content = await getContentSite();
  return (
    <section>
      <HeaderPage
        title={content?.sobre_npi?.header?.title}
        description={content?.sobre_npi?.header?.subtitle}
        image="/assets/images/imoveis/02.jpg"
      />
      <SobreNPI sobre={content?.sobre_npi} />
      <HistoriaNpi historia={content?.sobre_npi?.historia} />
      <VideoNpi missao={content?.sobre_npi?.missao} />
    </section>
  );
}
