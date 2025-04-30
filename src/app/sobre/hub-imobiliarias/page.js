import { HeaderPage } from "@/app/components/ui/header-page";
import { SobreHub } from "./components/SobreHub";
import { ComoFuncionaHub } from "./components/ComoFuncionaHub";
import { ReviewSection } from "@/app/components/sections/review-section";
import { FaqHub } from "./components/FaqHub";
import { ContactSection } from "@/app/components/sections/contact-section";
import { getContentSite } from "@/app/services";

export default async function SobrePage() {
  const content = await getContentSite();

  return (
    <section>
      <HeaderPage
        title={content?.sobre_hub?.header}
        description={content?.sobre_hub?.header_description}
        image="/assets/images/imoveis/02.jpg"
      />
      <SobreHub sobre={content?.sobre_hub} />
      <ReviewSection stats={content?.stats} />
      <ComoFuncionaHub howto={content?.sobre_hub?.howto} />
      <FaqHub faqs={content?.faq} />
      <ContactSection />
    </section>
  );
}
