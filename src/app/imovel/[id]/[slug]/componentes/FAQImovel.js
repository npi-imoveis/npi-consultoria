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

  // ✅ URL limpa e otimizada
  const whatsappMessage = encodeURIComponent(
    `NPi Consultoria - Gostaria de mais informações sobre ${imovel.Empreendimento}. Pode me ajudar?`
  );
  const whatsappUrl = `https://web.whatsapp.com/send?phone=5511969152222&text=${whatsappMessage}`;

  return (
    <div className="container mx-auto p-10 rounded-lg bg-zinc-50 mt-4">
      <span className="text-xl font-semibold text-black mb-6">
        Perguntas Frequentes sobre o {imovel.Empreendimento}
      </span>
      
      {/* ✅ FAQ Items com melhor estrutura semântica */}
      <div className="space-y-4 mt-6" role="region" aria-label="Perguntas frequentes">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
            <h3 className="font-semibold text-black text-base mb-2">{item.question}</h3>
            <p className="text-gray-700 text-sm">{item.answer}</p>
          </div>
        ))}
      </div>

      {/* ✅ Informações legais com melhor estrutura */}
      <div className="mt-6 space-y-2">
        <p className="text-sm text-zinc-800 font-medium">
          * Marque agora uma visita com um de nossos especialistas.
        </p>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>* As imagens apresentadas na galeria podem ser do imóvel em questão ou imagens meramente ilustrativas.</p>
          <p>* Temos excelentes opções em lançamento, em construção e prontos novos</p>
          <p>* Somos uma empresa de vendas de imóveis residenciais e corporativos na Zona Oeste e Zona Sul de São Paulo</p>
          <p>* Corretor Online - Fale agora com um especialista para mais informações.</p>
          <p className="font-semibold">* Author: Time de Vendas NPI Imóveis</p>
        </div>
      </div>

      {/* ✅ BOTÃO OTIMIZADO - HTML correto + Acessibilidade + Área de toque adequada */}
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          w-full mt-6 bg-black text-white py-4 px-6 rounded-md font-semibold
          hover:bg-gray-800 active:bg-gray-900
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
          transition-all duration-200
          flex items-center justify-center
          text-center
        "
        style={{
          minHeight: '48px', // ✅ Área de toque iOS adequada (>44px)
          touchAction: 'manipulation', // ✅ Performance touch
          WebkitTapHighlightColor: 'transparent', // ✅ Remove highlight iOS
        }}
        aria-label={`Ainda tenho dúvidas sobre ${imovel.Empreendimento} - Abrir WhatsApp para contato`}
        role="button" // ✅ Semântica correta para link que age como botão
      >
        <span>Ainda tenho dúvidas</span>
        
        {/* ✅ Ícone WhatsApp para melhor UX */}
        <svg 
          className="ml-2 w-4 h-4" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.50 3.488"/>
        </svg>
      </Link>
    </div>
  );
}
