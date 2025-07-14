import CustomCard from "../ui/custom-card";
import { TitleSection } from "../ui/title-section";

export function LuxuryGridSection() {
  return (
    <section className="flex flex-col justify-center ">
      <div className="pt-16">
        <TitleSection
          center
          section="Novidades"
          title="Outros produtos de luxo"
          description="Em breve em nosso HUB!"
        />
        <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-0 ">
          <CustomCard
            image="/assets/images/ferrari.jpg"
            sign="Em Breve"
            title="Carros Especiais"
            aspect="aspect-[3/1]"
          />
          <CustomCard
            image="/assets/images/iate.jpg"
            sign="Em Breve"
            title="Iates & Embarcações"
            aspect="aspect-[3/1]"
          />
          <CustomCard
            image="/assets/images/jato.jpg"
            sign="Em Breve"
            title="Aeronaves"
            aspect="aspect-[3/1]"
          />
          <CustomCard
            image="/assets/images/imoveis/04.jpg"
            title="Imóveis de Alto Padrão"
            aspect="aspect-[3/1]"
          />
        </div>
      </div>
    </section>
  );
}
