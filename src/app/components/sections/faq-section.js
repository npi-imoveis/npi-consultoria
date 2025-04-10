"use client";
import { useState } from "react";
import { TitleSection } from "../ui/title-section";
import Image from "next/image";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

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
    <section className="w-full pb-16 pt-10 px-10 ">
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
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className={`accordion py-6 border-b border-gray-200 ${openIndex === index ? "active" : ""
                      }`}
                  >
                    <button
                      className="flex justify-between items-center w-full text-left text-lg sm:text-xl font-medium text-gray-700 transition duration-500 hover:text-indigo-600"
                      onClick={() => toggleAccordion(index)}
                    >
                      <h4 className="text-base sm:text-lg text-black font-semibold">
                        {faq.question}
                      </h4>
                      <svg
                        className={`w-6 h-6 text-gray-900 transition-transform duration-500 ${openIndex === index
                          ? "rotate-180 text-indigo-600"
                          : ""
                          }`}
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.5 8.25L12.4142 12.3358C11.7475 13.0025 11.4142 13.3358 11 13.3358C10.5858 13.3358 10.2525 13.0025 9.58579 12.3358L5.5 8.25"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </button>
                    {openIndex === index && (
                      <div className="accordion-content w-full pt-4">
                        <p className="text-sm sm:text-base text-gray-800">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="w-full flex justify-end lg:w-1/2">
            <Image
              src="/assets/images/faq.jpg"
              alt="FAQ"

              width={500}
              height={500}
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
