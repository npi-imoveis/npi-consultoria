// src/app/components/sections/about-section.js
"use client"; // ✅ ADICIONAR: Tornar client-side para usar hooks
import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react"; // ✅ ADICIONAR: Imports necessários

export function AboutSection({ about }) { // ✅ REMOVER: async (não precisa mais)
  // ✅ ADICIONAR: Estados para imagem dinâmica
  const [imagemSobre, setImagemSobre] = useState("/uploads/home/about.jpg"); // fallback
  const [carregandoImagem, setCarregandoImagem] = useState(true);

  // ✅ ADICIONAR: useEffect para carregar imagem automaticamente
  useEffect(() => {
    carregarImagemAutomaticamente();
  }, []);

  const carregarImagemAutomaticamente = async () => {
    try {
      console.log('🔍 AboutSection: Carregando imagem automaticamente...');
      const response = await fetch('/api/admin/upload?directory=sobre');
      const data = await response.json();
      
      if (data.success && data.images && data.images.length > 0) {
        setImagemSobre(data.images[0]);
        console.log('✅ AboutSection: Imagem carregada:', data.images[0]);
      } else {
        console.log('📝 AboutSection: Usando imagem padrão');
        // Mantém a imagem padrão se não encontrar nenhuma
      }
    } catch (error) {
      console.error('❌ AboutSection: Erro ao carregar imagem:', error);
      // Mantém a imagem padrão em caso de erro
    } finally {
      setCarregandoImagem(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-6 py-16 px-10">
      <div className="relative flex-1">
        <div className="relative z-10 text-center lg:text-left">
          <span className="bg-[#8B6F4B] text-white px-5 py-2 text-sm font-bold">Quem somos</span>
          <h2 className="text-xl font-bold tracking-tight text-black my-5 uppercase">
            {about?.titulo || "HUB de Imobiliárias Boutique de Alto Padrão"}
          </h2>
          <span className="text-sm font-bold text-zinc-800">
            {about?.subtitulo || "Conectando sua imobiliária aos clientes de HIGH TICKET."}
          </span>
          <p className="text-black font-medium text-base py-5">
            {about?.descricao ||
              "Somos um ecossistema colaborativo que reúne imobiliárias boutique especializadas em imóveis de alto padrão, oferecendo uma estratégia inovadora para a captação de clientes de high ticket altamente qualificados. Combinamos tecnologia, atendimento premium e uma seleção rigorosa de propriedades para oferecer uma experiência única na compra e venda de imóveis sofisticados para nossos clientes"}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            <Button link="/sobre/hub-imobiliarias" text="Conheça o Hub" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center lg:justify-end">
        {carregandoImagem ? (
          // ✅ ADICIONAR: Loading state elegante
          <div className="z-10 w-full max-w-[500px] sm:w-[400px] lg:w-[500px] h-[400px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">
              <svg className="w-12 h-12 animate-spin mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm mt-2">Carregando...</p>
            </div>
          </div>
        ) : (
          // ✅ MODIFICAR: Usar imagem dinâmica em vez de fixa
          <Image
            src={imagemSobre} // ✅ MUDANÇA: Usar estado em vez de caminho fixo
            alt="Sobre a NPi Imóveis"
            width={400}
            height={400}
            className="z-10 w-full max-w-[500px] sm:w-[400px] lg:w-[500px]"
            onError={(e) => {
              console.error('❌ Erro ao carregar imagem:', imagemSobre);
              // Se der erro, volta para a imagem padrão
              setImagemSobre("/uploads/home/about.jpg");
            }}
            onLoad={() => {
              console.log('✅ Imagem AboutSection carregada e visível!');
            }}
          />
        )}
        
        {/* ✅ ADICIONAR: Badge de debug (apenas desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && !carregandoImagem && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-20">
            {imagemSobre.includes('/sobre/') ? '✅ Dinâmica' : '📁 Padrão'}
          </div>
        )}
      </div>
    </div>
  );
}
