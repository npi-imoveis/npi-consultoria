import { Button } from "@/app/components/ui/button";
import { Chip } from "@/app/components/ui/chip";
import Image from "next/image";
import Link from "next/link";

export default async function SobreNPI({ sobre }) {
  return (
    <section className="py-24 relative xl:mr-0 lg:mr-5 mr-0 bg-gray-50">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center xl:gap-16 gap-12 grid lg:grid-cols-2 grid-cols-1">
          
          {/* Coluna do Texto */}
          <div className="w-full flex flex-col justify-center lg:items-start items-center gap-8">
            <div className="w-full flex flex-col justify-center items-start gap-8">
              <div className="flex flex-col justify-start lg:items-start items-center gap-6">
                
                {/* Chip */}
                <Chip text="Quem Somos" />
                
                {/* Título e Descrição */}
                <div className="w-full flex flex-col justify-start lg:items-start items-center gap-6">
                  <h2 className="text-gray-900 text-2xl md:text-3xl lg:text-4xl font-bold leading-tight lg:text-start text-center">
                    {sobre?.title || "A NPi Imóveis nasceu em 2007"}
                  </h2>
                  
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed lg:text-start text-center">
                    {sobre?.description ||
                      "A ideia inicial era suprir algumas lacunas de um mercado imobiliário em plena expansão, aproximando o cliente da construtora. Assim nascíamos com uma proposta inovadora e fomos pioneiros em realizar parcerias B2B com as maiores construtoras do mercado, algo que não existia na época. Com isso, aproximávamos o nosso cliente final aos donos ou diretores das incorporadoras, realizando negociações extremamente rentáveis para os compradores, e acelerávamos as vendas das construtoras."}
                  </p>
                  
                  {/* Estatísticas rápidas */}
                  <div className="grid grid-cols-3 gap-6 w-full mt-6">
                    <div className="text-center lg:text-left">
                      <div className="text-2xl md:text-3xl font-bold text-[#8B6F4B]">15+</div>
                      <div className="text-sm text-gray-600">Anos</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-2xl md:text-3xl font-bold text-[#8B6F4B]">20.000+</div>
                      <div className="text-sm text-gray-600">Clientes</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-2xl md:text-3xl font-bold text-[#8B6F4B]">1º</div>
                      <div className="text-sm text-gray-600">No Google</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botão */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                link="/sobre/hub-imobiliarias" 
                text="Conheça o Hub" 
                className="bg-[#8B6F4B] hover:bg-[#7A5E42] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <Link 
                href="/sobre/nossos-servicos"
                className="border-2 border-[#8B6F4B] text-[#8B6F4B] hover:bg-[#8B6F4B] hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center inline-block"
              >
                Nossos Serviços
              </Link>
            </div>
          </div>
          
          {/* Coluna da Imagem */}
          <div className="w-full flex lg:justify-end justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Container principal da imagem */}
              <div className="relative">
                {/* Fundo decorativo */}
                <div className="absolute -top-4 -right-4 w-full h-full bg-[#8B6F4B]/10 rounded-3xl"></div>
                
                {/* Container da imagem */}
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                  <Image
                    src={sobre?.image || "/uploads/sobre_npi/sobre.jpg?v=2024dec"}
                    alt="NPi Imóveis - Escritório e equipe especializada desde 2007"
                    width={600}
                    height={700}
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: '4/5' }}
                    unoptimized={true}
                  />
                  
                  {/* Badge flutuante */}
                  <div className="absolute top-6 left-6 bg-[#8B6F4B] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Desde 2007
                  </div>
                  
                  {/* Gradiente sutil na parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
              
              {/* Elementos decorativos */}
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-200/30 rounded-full blur-xl"></div>
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-[#8B6F4B]/20 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
