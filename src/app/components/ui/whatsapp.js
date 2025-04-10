"use client";

import Image from "next/image";

export function WhatsappFloat() {
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
    const whatsappUrl = `${baseUrl}?phone=5511969152222`;

    // Redirecionar para o WhatsApp
    window.location.href = whatsappUrl;
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <a
        href="#"
        onClick={handleWhatsAppClick}
        className="cursor-pointer"
      >
        <Image src="/assets/images/whatsapp.png" height={48} width={48} alt="Fale conosco pelo WhatsApp" unoptimized />
      </a>
    </div>
  );
}
