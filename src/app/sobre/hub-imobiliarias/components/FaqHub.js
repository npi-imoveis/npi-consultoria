import { TitleSection } from "@/app/components/ui/title-section";

export async function FaqHub({ faqs }) {
  return (
    <section className="py-16 px-10 lg:px-0 lg:py-24">
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          {/* FAQ Content */}
          <div className="w-full lg:w-1/2">
            <div className="lg:max-w-xl">
              <TitleSection
                section="FAQ"
                title="Perguntas frequentes"
                description="Encontre respostas para as perguntas mais comuns sobre o HUB."
              />
              <div className="accordion-group">
                {faqs && Array.isArray(faqs) && faqs.length > 0 ? (
                  faqs.map((faq, index) => (
                    <div key={index} className="accordion py-6 border-b border-gray-200">
                      <div className="flex justify-between items-center w-full text-left text-lg sm:text-xl font-medium text-gray-700">
                        <p className="text-base sm:text-lg text-black font-semibold">
                          {faq.question}
                        </p>
                      </div>
                      <div className="accordion-content w-full pt-4">
                        <p className="text-sm sm:text-base text-gray-800">{faq.answer}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Perguntas frequentes em breve...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2">
            <img
              title="FAQ - Perguntas frequentes sobre o HUB"
              src="/assets/images/faq-about.jpg"
              alt="FAQ"
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
