"use client"; // Se estiver usando Next.js App Router (páginas em app/...)

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
      {/* Logo */}
     <Link href="/">
   <Image 
    title="NPi Imóveis - Hub de Imobiliárias Boutique de Alto Padrão"
    src="/assets/images/logo_light.png" 
    height={100} 
    width={100} 
    alt="logo" 
     />
     </Link>

      {/* Ícone do menu mobile */}
      <button
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
      >
        {isMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
      </button>

      {/* Menu Desktop */}
      <nav className="hidden md:flex items-center space-x-8 text-white/60 uppercase text-xs">
        <Link className="font-bold text-white hover:text-[#8B6F4B] tracking-widest" href="/busca">
          Encontre seu imóvel
        </Link>

        <Link className="font-bold hover:text-[#8B6F4B] tracking-widest" href="/venda-seu-imovel">
          Anunciar
        </Link>
        <Link
          className="font-bold hover:text-[#8B6F4B] tracking-widest"
          href="/sobre/hub-imobiliarias"
        >
          Conheça o Hub
        </Link>
      </nav>

      {/* Contato (Desktop apenas) */}
      <div className="hidden md:flex text-xs text-white font-bold rounded-lg items-center">
        <div className="mr-2">
          <PhoneIcon className="w-4 h-4" />
        </div>
        <span>(11) 2614-4414</span>
      </div>

      {/* Menu Mobile Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black bg-opacity-95 py-6 flex flex-col items-center space-y-6 text-white text-lg md:hidden">
          <Link
            className="hover:text-[#8B6F4B] text-white"
            href="/busca"
            onClick={() => setIsMenuOpen(false)}
          >
            Encontre seu imóvel
          </Link>

          <Link
            className="hover:text-[#8B6F4B] text-white"
            href="/venda-seu-imovel"
            onClick={() => setIsMenuOpen(false)}
          >
            Anunciar
          </Link>
          <Link
            className="hover:text-[#8B6F4B] text-white"
            href="/sobre/hub-imobiliarias"
            onClick={() => setIsMenuOpen(false)}
          >
            Conheça o Hub
          </Link>
          {/* Contato no Mobile */}
          <div className="flex items-center mt-4 text-xs">
            <div className="mr-2 text-xs">
              <PhoneIcon className="w-4 h-4" />
            </div>
            <span className="">(11) 2614-4414</span>
          </div>
        </div>
      )}
    </header>
  );
}
