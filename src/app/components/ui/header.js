"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhoneIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Header({ effect = true }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full py-2 px-4 md:px-10 
        flex justify-between items-center 
        z-[999999]
        ${
          effect
            ? isScrolled
              ? "bg-black/90 border-none"
              : "bg-transparent border-b-2 border-zinc-500 border-opacity-20"
            : isScrolled
            ? "bg-black/90 border-none"
            : "bg-black border-none"
        }
        transition-colors duration-300
      `}
    >
      {/* ✅ LOGO OTIMIZADO - Responsivo + Performance */}
      <Link href="/" className="flex-shrink-0">
        <div
          className="relative"
          style={{
            width: '80px', // ✅ Menor no mobile
            height: '80px',
            aspectRatio: '1 / 1', // ✅ Previne layout shift
          }}
        >
          <Image 
            src="/assets/images/logo_light.png" 
            alt="NPi Imóveis - Hub de Imobiliárias Boutique de Alto Padrão"
            title="NPi Imóveis - Hub de Imobiliárias Boutique de Alto Padrão"
            fill
            sizes="(max-width: 768px) 80px, 100px" // ✅ Responsivo adequado
            className="object-contain" // ✅ Mantém aspect ratio
            priority={true} // ✅ Logo é crítico
            quality={90} // ✅ Quality adequada para logo
          />
        </div>
      </Link>

      {/* ✅ BOTÃO MENU MOBILE OTIMIZADO - Área de toque 44px+ */}
      <button
        className="md:hidden text-white p-2 rounded-lg transition-colors duration-200 hover:bg-white/10 focus:bg-white/10"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
        aria-expanded={isMenuOpen} // ✅ Estado do menu para screen readers
        aria-controls="mobile-menu" // ✅ Conecta com o menu
        style={{
          minHeight: '44px', // ✅ iOS touch target mínimo
          minWidth: '44px',
          touchAction: 'manipulation', // ✅ Performance touch
          WebkitTapHighlightColor: 'transparent', // ✅ Remove highlight iOS
        }}
      >
        {isMenuOpen ? (
          <XMarkIcon className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {/* ✅ MENU DESKTOP - Acessibilidade melhorada */}
      <nav 
        className="hidden md:flex items-center space-x-8 text-white/60 uppercase text-xs"
        role="navigation"
        aria-label="Menu principal"
      >
        <Link 
          className="font-bold text-white hover:text-[#8B6F4B] tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1" 
          href="/busca"
        >
          Encontre seu imóvel
        </Link>
        <Link 
          className="font-bold hover:text-[#8B6F4B] tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1" 
          href="/venda-seu-imovel"
        >
          Anunciar
        </Link>
        <Link
          className="font-bold hover:text-[#8B6F4B] tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded px-2 py-1"
          href="/sobre/hub-imobiliarias"
        >
          Conheça o Hub
        </Link>
      </nav>

      {/* ✅ CONTATO DESKTOP - Acessibilidade melhorada */}
      <div className="hidden md:flex text-xs text-white font-bold rounded-lg items-center">
        <div className="mr-2" aria-hidden="true">
          <PhoneIcon className="w-4 h-4" />
        </div>
        <a 
          href="tel:+551126144414" 
          className="hover:text-[#8B6F4B] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black rounded px-1"
          aria-label="Ligar para (11) 2614-4414"
        >
          (11) 2614-4414
        </a>
      </div>

      {/* ✅ MENU MOBILE DROPDOWN - Acessibilidade completa */}
      {isMenuOpen && (
        <div 
          id="mobile-menu" // ✅ ID para aria-controls
          className="absolute top-16 left-0 w-full bg-black bg-opacity-95 py-6 flex flex-col items-center space-y-6 text-white text-lg md:hidden"
          role="navigation"
          aria-label="Menu mobile"
          style={{
            // ✅ Smooth animation
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          <Link
            className="hover:text-[#8B6F4B] text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-4 py-2"
            href="/busca"
            onClick={() => setIsMenuOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            Encontre seu imóvel
          </Link>
          <Link
            className="hover:text-[#8B6F4B] text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-4 py-2"
            href="/venda-seu-imovel"
            onClick={() => setIsMenuOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            Anunciar
          </Link>
          <Link
            className="hover:text-[#8B6F4B] text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-4 py-2"
            href="/sobre/hub-imobiliarias"
            onClick={() => setIsMenuOpen(false)}
            style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
          >
            Conheça o Hub
          </Link>
          
          {/* ✅ CONTATO MOBILE - Área de toque adequada */}
          <div className="flex items-center mt-4 text-xs">
            <div className="mr-2 text-xs" aria-hidden="true">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <a 
              href="tel:+551126144414"
              className="hover:text-[#8B6F4B] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
              aria-label="Ligar para (11) 2614-4414"
              style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
            >
              (11) 2614-4414
            </a>
          </div>
        </div>
      )}

      {/* ✅ CSS para animação do menu mobile */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
