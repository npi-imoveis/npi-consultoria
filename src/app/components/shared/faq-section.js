"use client";
import { useState, useRef } from "react";
import { TitleSection } from "../ui/title-section";
import { sectionStyles } from "@/app/styles/section-styles";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  // Referências para os conteúdos dos accordions
  const contentRefs = useRef([]);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Como funciona a setorização no HUB?",
      answer:
        "Cada imobiliária parceira do HUB se especializa em uma região ou bairro específico. Isso permite que elas ofereçam um atendimento mais personalizado e eficaz, com profundo conhecimento do mercado local, resultando em uma maior taxa de conversão de leads.",
    },
    {
      question: "Quem pode se tornar um parceiro do HUB?",
      answer:
        "Selecionamos imobiliárias com base em critérios rigorosos, incluindo expertise no mercado de alto padrão, alinhamento com nossos valores e fit cultural. As imobiliárias precisam ter um forte conhecimento da região onde atuam e um compromisso com a excelência no atendimento.",
    },
    {
      question: "Como os clientes são distribuídos entre as imobiliárias?",
      answer:
        "A NPi Imóveis gera e qualifica os clientes, distribuindo-os para as imobiliárias parceiras com base na especialização regional. Isso garante que cada cliente seja atendido pela imobiliária mais capacitada para lidar com suas necessidades específicas.",
    },
    {
      question: "Quais são os benefícios de participar do HUB?",
      answer:
        "As imobiliárias parceiras se beneficiam de clientes qualificados, suporte tecnológico, treinamentos contínuos, e a força de um ecossistema colaborativo. Esse modelo permite que os parceiros se concentrem em seu core business enquanto têm acesso a uma rede de apoio e recursos de ponta.",
    },
  ];

  return (
    <section
      className={`${sectionStyles.section} ${sectionStyles.variants.light}`}
    >
      <div className={`${sectionStyles.container}`}>
        <div className={`${sectionStyles.layouts.twoColumn}`}>
          {/* FAQ Content */}
          <div className="h-full">
            <div className="lg:max-w-xl">
              <TitleSection
                section="FAQ"
                title="Perguntas frequentes"
                description="Encontre respostas para as perguntas mais comuns sobre o HUB."
              />
              <div className="mt-8">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`mb-4 rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 ${
                      openIndex === index ? "shadow-md" : ""
                    }`}
                  >
                    <button
                      className="flex justify-between items-center w-full text-left p-5 bg-white hover:bg-gray-50 transition-all duration-300"
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={openIndex === index}
                      aria-controls={`accordion-content-${index}`}
                    >
                      <p className="text-base sm:text-lg text-gray-800 font-semibold pr-4">
                        {faq.question}
                      </p>
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-500 ${
                          openIndex === index
                            ? "bg-[#8B6F4B] text-white transform rotate-180"
                            : "text-gray-500"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 transition-transform duration-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19 9L12 16L5 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                      </div>
                    </button>

                    {/* Conteúdo do accordion com altura fixa e animação */}
                    <div
                      id={`accordion-content-${index}`}
                      ref={(el) => (contentRefs.current[index] = el)}
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        openIndex === index
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                      aria-hidden={openIndex !== index}
                    >
                      <div className="p-5 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image - Com altura fixa para evitar movimento */}
          <div className="relative h-[600px]">
            <div className="sticky top-8 h-[600px] w-full overflow-hidden rounded-lg shadow-xl">
              <img
                src="/assets/images/faq.jpg"
                alt="FAQ"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Tire suas dúvidas</h3>
                <p className="text-sm opacity-90">
                  Estamos aqui para ajudar você a entender melhor como funciona
                  o HUB de imobiliárias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
