import Link from "next/link";

export function FAQImovel({ imovel }) {
  let faqItems = [
    {
      question: `Qual a metragem do ${imovel.Empreendimento}?`,
      answer: `Apartamento a partir de ${imovel.AreaPrivativa} m² de área útil.`,
    },
    {
      question: `Quantos dorms?`,
      answer: `A partir de ${imovel.Dormitorios} quartos.`,
    },
    {
      question: `Quantas vagas de garagem tem o ${imovel.Empreendimento}?`,
      answer: `A partir de ${imovel.Vagas} vagas de garagem.`,
    },
    {
      question: `Qual o status da obra do ${imovel.Empreendimento}?`,
      answer: imovel.Situacao,
    },
    {
      question: `Onde vejo as plantas?`,
      answer: `Na galeria de imagens você verá as plantas e implantação do condomínio.`,
    },
    {
      question: `Qual o preço do ${imovel.Empreendimento}?`,
      answer: `${imovel.Empreendimento} preço a partir de ${imovel.ValorAntigo}`,
    },
    {
      question: `Qual a construtora deste empreendimento?`,
      answer: imovel.Construtora,
    },
  ];

  return (
    <div className="container mx-auto p-10 rounded-lg bg-zinc-50 mt-4">
      <span className="text-xl font-semibold text-black mb-6">
        Perguntas Frequentes sobre o {imovel.Empreendimento}
      </span>
      <div className="space-y-4 mt-6">
        {faqItems.map((item, index) => (
          <div key={index}>
            <h3 className="font-semibold text-black text-base">{item.question}</h3>
            <h4 className="text-gray-700 text-sm mt-2">{item.answer}</h4>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-zinc-800">
        * Marque agora uma visita com um de nossos especialistas.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        * As imagens apresentadas na galeria podem ser do imóvel em questão ou imagens meramente
        ilustrativas.
      </p>
      <p className="mt-1 text-xs text-gray-500">
        * Temos excelentes opções em lançamento, em construção e prontos novos
      </p>
      <p className="mt-1 text-xs text-gray-500">
        * Somos uma empresa de vendas de imóveis residenciais e corporativos na Zona Oeste e Zona
        Sul de São Paulo
      </p>
      <p className="mt-1 text-xs text-gray-500">
        * Corretor Online - Fale agora com um especialista para mais informações.
      </p>
      <p className="mt-1 text-xs text-gray-500 font-semibold">
        * Author: Time de Vendas NPI Imóveis
      </p>
      <button className="w-full mt-6 bg-black text-white py-3 rounded-md font-semibold">
        <Link
          href="https://web.whatsapp.com/send?phone=5511969152222&text=NPi%20Consultoria%20-%20Im%C3%B3veis%20de%20Alto%20Padr%C3%A3o.%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o(a)%20Apartamento%20no%20bairro%20Ibirapuera%20que%20vi%20no%20site%20de%20voc%C3%AAs:%20https://www.npiconsultoria.com.br/imovel-105627/horiz-ibirapuera%20-%20H%C3%B3riz%20Ibirapuera.%20Pode%20me%20ajudar?"
          target="_blank"
        >
          Ainda tenho dúvidas
        </Link>
      </button>
    </div>
  );
}
