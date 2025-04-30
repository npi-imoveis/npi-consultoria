import { HeaderPage } from "@/app/components/ui/header-page";
import { SobreHub } from "./components/SobreHub";
import { ComoFuncionaHub } from "./components/ComoFuncionaHub";
import { ReviewSection } from "@/app/components/sections/review-section";
import { FaqHub } from "./components/FaqHub";
import { ContactSection } from "@/app/components/sections/contact-section";

export default async function SobrePage() {
  const data = await fetch(`${process.env.API_URL}/admin/content`);
  const content = await data.json();

  return (
    <section>
      <HeaderPage
        title={content?.data?.sobre_hub?.header}
        description={content?.data?.sobre_hub?.header_description}
        image="/assets/images/imoveis/02.jpg"
      />
      <SobreHub sobre={content?.data?.sobre_hub} />
      <ReviewSection stats={content?.data?.stats} />
      <ComoFuncionaHub howto={content?.data?.sobre_hub?.howto} />
      <FaqHub faqs={content?.data?.faq} />
      <ContactSection />
    </section>
  );
}
