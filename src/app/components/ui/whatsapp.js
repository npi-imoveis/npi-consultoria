"use client";

import Image from "next/image";

export function WhatsappFloat({ message }) {
  const handleWhatsAppClick = (e) => {
    e.preventDefault();

    // Função para detectar dispositivo móvel
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Escolher a URL base apropriada
    const baseUrl = isMobile()
      ? 'whatsapp://send'
      : 'https://web.whatsapp.com/send';

    // Construir a URL completa
    let whatsappUrl = `${baseUrl}?phone=5511969152222`;

    if (message) {
      whatsappUrl = `${baseUrl}?phone=5511969152222&text=${encodeURIComponent(message)}`;
    }

    // Redirecionar para o WhatsApp
    if (isMobile()) {
      window.location.href = whatsappUrl;
    } else {
      // Em PCs, abrir em uma nova guia
      window.open(whatsappUrl, '_blank');
    }
  };

 return (
  <div className="fixed bottom-5 right-5 z-[9999]">
    
      href="#"
      onClick={handleWhatsAppClick}
      className="cursor-pointer"
    >
      <Image 
        src="/assets/images/whatsapp.png" 
        height={48} 
        width={48} 
        alt="Fale conosco pelo WhatsApp" 
        title="Fale conosco pelo WhatsApp - NPi Imóveis"
        unoptimized 
      />
    </a>
  </div>
);
