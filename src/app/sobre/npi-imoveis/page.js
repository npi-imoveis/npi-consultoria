import { HeaderPage } from "@/app/components/ui/header-page";
import SobreNPI from "./sections/SobreNpi";

import { HistoriaNpi } from "./sections/HistoriaNpi";
import VideoNpi from "./sections/VideoNpi";

export default async function SobrePage() {
  const data = await fetch(`${process.env.API_URL}/admin/content`);
  const content = await data.json();
  return (
    <section>
      <HeaderPage
        title={content?.data?.sobre_npi?.header?.title}
        description={content?.data?.sobre_npi?.header?.subtitle}
        image="/assets/images/imoveis/02.jpg"
      />
      <SobreNPI sobre={content?.data?.sobre_npi} />
      <HistoriaNpi historia={content?.data?.sobre_npi?.historia} />
      <VideoNpi missao={content?.data?.sobre_npi?.missao} />
    </section>
  );
}
