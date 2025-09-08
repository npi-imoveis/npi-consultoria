"use client";

import { formatterValue } from "@/app/utils/formatter-value";

const formatarValorMonetario = (valor) => {
  if (!valor) return "Não informado";

  // Remover espaços e verificar se é número
  const valorNumerico = valor.toString().trim();
  if (!valorNumerico || isNaN(Number(valorNumerico))) return "Não informado";

  // Formatar para o padrão brasileiro com vírgulas para centavos
  const valorFormatado = Number(valorNumerico).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `R$ ${valorFormatado}`;
};

export default function ValoresUnidade({ imovel }) {
  // 🚨 CORREÇÃO GSC: Validar slug antes de usar em URLs
  const slugsInvalidos = [
    'facebook.com/npiimoveis',
    'instagram.com/npi_imoveis', 
    'indexdata/index.swf'
  ];
  
  const slugValido = imovel.Slug && !slugsInvalidos.includes(imovel.Slug) ? imovel.Slug : null;
  const url = slugValido 
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${slugValido}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}`;
  function sendWhatsapp() {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    // Construir a mensagem
    const message = `Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponível no link: ${url}`;

    // Escolher a URL base apropriada
    const baseUrl = isMobile() ? "whatsapp://send" : "https://web.whatsapp.com/send";

    // Construir a URL completa
    const whatsappUrl = `${baseUrl}?phone=5511969152222&text=${encodeURIComponent(message)}`;

    // Redirecionar para o WhatsApp
    if (isMobile()) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
    }
  }
  return (
    <div className="px-6 pt-6 bg-white rounded-lg">
      <div itemScope itemType="https://schema.org/Offer">
        <p className="text-black font-medium">Preço:</p>
        {imovel.Status === "LOCAÇÃO" &&
        imovel.ValorAluguelSite !== "0" &&
        imovel.ValorAluguelSite !== "" ? (
          <h2
            className="text-2xl font-bold mt-2"
            itemProp="price"
            content={imovel.ValorAluguelSite}
          >
            {formatterValue(imovel.ValorAluguelSite)}
          </h2>
        ) : (
          <h2
            className="text-2xl font-bold mt-2"
            itemProp="price"
            content={imovel.ValorAntigo || "Consultar"}
          >
            {imovel.ValorAntigo !== "0" ? (
              "R$ " + imovel.ValorAntigo
            ) : (
              <button
                onClick={sendWhatsapp}
                className="bg-[#8B6F48] text-white text-sm px-4 py-2 rounded-lg w-full"
              >
                Quero um imóvel nesse condomínio.
              </button>
            )}
          </h2>
        )}
        <meta itemProp="priceCurrency" content="BRL" />
      </div>

      <div className="grid grid-cols-2 gap-3 my-8">
        {imovel.Status === "VENDA E LOCAÇÃO" &&
          imovel.ValorAluguelSite !== "0" &&
          imovel.ValorAluguelSite !== "" && (
            <div className="flex flex-col bg-zinc-100 p-3 rounded-lg">
              <p className="text-sm text-zinc-600">Aluguel:</p>
              <p className="text-black font-semibold">R$ {imovel.ValorAluguelSite}</p>
            </div>
          )}

        <div className="flex flex-col bg-zinc-100 p-3 rounded-lg">
          <p className="text-sm text-zinc-600">Condomínio</p>
          <p className="text-black font-semibold">
            {formatarValorMonetario(imovel.ValorCondominio)}
          </p>
        </div>
        <div className="flex flex-col bg-zinc-100 p-3 rounded-lg">
          <p className="text-sm text-zinc-600">IPTU</p>
          <p className="text-black font-semibold">{formatarValorMonetario(imovel.ValorIptu)}</p>
        </div>
      </div>
    </div>
  );
}
