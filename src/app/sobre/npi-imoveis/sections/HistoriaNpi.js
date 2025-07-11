import Image from "next/image";

export async function HistoriaNpi({ historia }) {
  return (
    <section className="bg-zinc-100 py-24 px-6 lg:px-0">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-xl uppercase font-bold text-black">Nossa História</h1>
          <p className="text-lg max-w-2xl mx-auto mt-4">
            Conheça a evolução da NPi e como nos tornamos referência no mercado imobiliário de alto
            padrão.
          </p>
        </div>

        {/* Linha do Tempo */}
        <div className="relative border-l-4 border-zinc-200 pl-8 lg:pl-12 space-y-16">
          {historia && Array.isArray(historia) && historia.length > 0 ? (
            historia.map((item, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-center gap-8 group">
                {/* Texto */}
                <div className="lg:w-1/2 text-center lg:text-left">
                  <h1 className="text-2xl font-semibold text-black group-hover:text-[#8B6F4B text-white] transition duration-300">
                    {item.ano}
                  </h1>
                  <h1 className="text-xl font-bold text-gray-900 mt-2">{item.title}</h1>
                  <p className="text-black text-lg mt-4">{item.description}</p>
                </div>

                {/* Imagem */}
                <div className="lg:w-1/2">
                  <div className="relative w-full h-[250px] lg:h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={`/uploads/historia/0${index + 1}.jpg`}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Conteúdo em breve...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
