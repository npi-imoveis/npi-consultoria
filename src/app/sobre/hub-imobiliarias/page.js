import { HeaderPage } from "@/app/components/ui/header-page";
import { SobreHub } from "./components/SobreHub";
import { ComoFuncionaHub } from "./components/ComoFuncionaHub";
import { ReviewSection } from "@/app/components/sections/review-section";
import { FaqHub } from "./components/FaqHub";
import { ContactSection } from "@/app/components/sections/contact-section";
import { getContentHome } from "@/app/lib/site-content";


export default async function SobrePage() {
  const content = await getContentHome();

  return (
    <section>
      <HeaderPage
        title={content["sobre_titulo"]}
        description={content["sobre_subtitulo"]}
        image="/assets/images/imoveis/02.jpg"
      />
      <QuemSomos />
    </section>
  );
}

function QuemSomos() {
  return (
    <div className="min-h-[600px]">
      <SobreHub />
      <ReviewSection />
      <ComoFuncionaHub />
      <FaqHub />
      <ContactSection />
    </div>
  );
}
