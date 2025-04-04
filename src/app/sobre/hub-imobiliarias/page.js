import { HeaderPage } from "@/app/components/ui/header-page";
import { HeroHub } from "./components/HeroHub";
import { SobreHub } from "./components/SobreHub";
import { ComoFuncionaHub } from "./components/ComoFuncionaHub";
import { FaqSection } from "@/app/components/sections/faq-section";
import { ReviewSection } from "@/app/components/sections/review-section";
import { FaqHub } from "./components/FaqHub";
import { ContactSection } from "@/app/components/sections/contact-section";

export default function SobrePage() {
  return (
    <section>
      <HeaderPage
        title="HUB de Imobiliárias Boutique de Alto Padrão"
        description="Ecossistema colaborativo que reúne imobiliárias boutique especializadas em imóveis de alto padrão, oferecendo uma estratégia inovadora para a captação de clientes de high ticket altamente qualificados."
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
