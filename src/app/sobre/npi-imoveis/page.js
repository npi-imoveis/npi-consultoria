import { HeaderPage } from "@/app/components/ui/header-page";
import SobreNPI from "./sections/SobreNpi";

import { HistoriaNpi } from "./sections/HistoriaNpi";
import VideoNpi from "./sections/VideoNpi";
import getContent from "@/app/lib/get-content";

export default async function SobrePage() {
  const content = await getContent();
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
