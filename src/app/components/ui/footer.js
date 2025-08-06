import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-200" aria-labelledby="footer-heading">
      <div className="container mx-auto px-4 py-12 md:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-black">
        {/* Coluna 1 - Informações da NPi */}
        <div>
          <h3 className="font-semibold text-lg mb-3">NPi</h3>
          <p className="text-sm font-bold">Negociação Personalizada de Imóveis</p>
          <p className="text-sm mt-2">CRECI: 22013-J</p>
          <p className="text-sm">CNPJ: 13.007.405/0001-01</p>

          <div className="mt-6">
            <span className="font-semibold mb-2">Endereço</span>
            <address className="text-sm not-italic">
              LWM Corporate
              <br />
              Rua George Ohm, 206
              <br />
              Cj. 101 – Torre B – Brooklin
              <br />
              São Paulo – SP – 04576-020
            </address>
          </div>
        </div>

        {/* Coluna 2 - Contato */}
        <div>
          <h3 className="font-semibold mb-3">Contato</h3>
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Telefone</h4>
            <a
              href="tel:+551126144414"
              className="flex items-center space-x-2 text-sm group hover:underline transition-colors py-2"
            >
              <PhoneIcon className="w-5 h-5" aria-hidden="true" />
              <span className="group-hover:underline">(11) 2614-4414</span>              
            </a>
              <p className="text-sm">Whatsapp: (11) 96915-2222</p>  
          </div>

          <div>
            <span className="font-semibold mb-2">Email</span>
            <a
              href="mailto:npi@npiconsultoria.com.br"
              className="flex items-center space-x-2 text-sm group hover:underline transition-colors py-2"
            >
              <EnvelopeIcon className="w-5 h-5" aria-hidden="true" />
              <span className="group-hover:underline">npi@npiconsultoria.com.br</span>
            </a>
          </div>
        </div>

        {/* Coluna 3 - Navegação */}
        <div>
          <h3 className="font-semibold mb-3">Navegue</h3>
          <nav aria-label="Links de navegação do rodapé">
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sobre/hub-imobiliarias"
                  className="inline-block py-2 hover:underline transition-colors"
                >
                  Conheça o HUB
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre/npi-imoveis"
                  className="inline-block py-2 hover:underline transition-colors"
                >
                  Sobre a NPi
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre/nossos-servicos"
                  className="inline-block py-2 hover:underline transition-colors"
                >
                  Nossos Serviços
                </Link>
              </li>
              <li>
                <Link
                  href="/venda-seu-imovel"
                  className="inline-block py-2 hover:underline transition-colors"
                >
                  Venda seu imóvel
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Coluna 4 - Logo HUB OTIMIZADO - SINTAXE CORRIGIDA */}
        <div className="text-center md:text-right">
          <h3 className="font-semibold mb-1">Hub de Imobiliárias</h3>
          <p className="font-semibold">Boutique de Alto Padrão</p>
          <div className="mt-4 flex justify-center md:justify-end">
            {/* ✅ OTIMIZAÇÃO CRÍTICA: bg-hub.png (80 KiB economia) - SINTAXE CORRIGIDA */}
            <div 
              style={{ 
                width: '120px',
                height: '120px',
                position: 'relative',
                contain: 'layout style paint'
              }}
            >
              <Image
                src="/assets/images/bg-hub.png"
                alt="Logo Hub de Imobiliárias Boutique de Alto Padrão da NPi"
                title="Logo Hub de Imobiliárias Boutique de Alto Padrão da NPi"
                fill
                sizes="120px"
                loading="lazy"
                quality={75}
                className="object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Linha inferior do Footer */}
      <div className="border-t-2 border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Links de políticas */}
          <div className="order-2 md:order-1">
            <Link
              href="/politica-de-privacidade"
              className="text-sm py-2 px-3 inline-block hover:underline"
            >
              Política de Privacidade
            </Link>
          </div>

          {/* Copyright */}
          <div className="order-3 md:order-2 text-center text-sm">
            <p className="font-semibold">
              © {currentYear} - Todos os Direitos Reservados | NPi Consultoria - Imóveis de Alto
              Padrão
            </p>
          </div>

          {/* Ícones de redes sociais */}
          <div className="order-1 md:order-3 flex items-center space-x-4">
            <Link
              href="https://www.instagram.com/npi_imoveis"
              aria-label="Siga-nos no Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors p-2"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.00116 2C4.23616 2 2 4.23616 2 7.00116V16.9988C2 19.7638 4.23616 22 7.00116 22H16.9988C19.7638 22 22 19.7638 22 16.9988V7.00116C22 4.23616 19.7638 2 16.9988 2H7.00116ZM18.6946 4.33466C19.1985 4.33466 19.602 4.73816 19.602 5.24207C19.602 5.74599 19.1985 6.14949 18.6946 6.14949C18.1907 6.14949 17.7872 5.74599 17.7872 5.24207C17.7872 4.73816 18.1907 4.33466 18.6946 4.33466ZM12.0001 7.00375C14.7572 7.00375 17.0002 9.24575 17.0002 12.0028C17.0002 14.7599 14.7572 17.0029 12.0001 17.0029C9.24306 17.0029 7.00106 14.7599 7.00106 12.0028C7.00106 9.24575 9.24306 7.00375 12.0001 7.00375ZM12.0001 8.58914C10.0717 8.58914 8.50096 10.1599 8.50096 12.0883C8.50096 14.0167 10.0717 15.5874 12.0001 15.5874C13.9285 15.5874 15.4992 14.0167 15.4992 12.0883C15.4992 10.1599 13.9285 8.58914 12.0001 8.58914Z" />
              </svg>
            </Link>
            <Link
              href="https://www.facebook.com/npiimoveis"
              aria-label="Visite nossa página no Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors p-2"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22.676 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.406.593 24 1.325 24h11.495v-9.283H9.691V11.08h3.129V8.413c0-3.1 1.894-4.788 4.66-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.92c-1.507 0-1.8.716-1.8 1.765v2.309h3.59l-.467 3.636h-3.123V24h6.116c.73 0 1.323-.593 1.323-1.324V1.325C24 .593 23.406 0 22.675 0z" />
              </svg>
            </Link>
            <Link
              href="https://www.youtube.com/c/NPiIMOVEIS"
              aria-label="Assista nossos vídeos no YouTube"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors p-2"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.615 3.184C20.358 3.41 20.942 4.008 21.167 4.752 21.57 6.142 22 9.07 22 12s-.43 5.858-.833 7.248c-.225.744-.809 1.342-1.552 1.568-1.405.39-7.615.39-7.615.39s-6.21 0-7.615-.39c-.743-.226-1.327-.824-1.552-1.568C2.43 17.858 2 14.93 2 12s.43-5.858.833-7.248c.225-.744.809-1.342 1.552-1.568C5.028 3 11.238 3 11.238 3s6.21 0 7.615.184h.762zm-9.49 5.509v5.613l4.956-2.807-4.956-2.806z" />
              </svg>
            </Link>
            <Link
              href="https://www.linkedin.com/company/npi"
              aria-label="Conecte-se conosco no LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors p-2"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.77 0 5-2.24 5-5V5c0-2.76-2.23-5-5-5zM8.48 19H5.56V9h2.92v10zM7.02 7.66c-.94 0-1.7-.77-1.7-1.7 0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7c0 .93-.77 1.7-1.7 1.7zm12 11.34h-2.92v-4.81c0-1.15-.02-2.62-1.6-2.62-1.59 0-1.84 1.24-1.84 2.54v4.89h-2.92V9h2.8v1.37h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.46v5.69z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
