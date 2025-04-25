import { getContentStats } from "@/app/lib/site-content";

export async function ReviewSection() {
  const content = await getContentStats();

  return (
    <div className="bg-gradient-to-r from-black to-zinc-800 min-h-[600px] py-16  flex flex-col justify-center items-center">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center space-y-4">
            <h3 className="text-lg sm:text-xl uppercase font-bold tracking-tight text-white">
              Nossos resultados <br className="hidden sm:block" />
              em números
            </h3>
            <p className="text-base sm:text-lg leading-8 text-gray-300">
              Nosso trabalho é focado em resultados.
            </p>
          </div>

          <div className="mt-8 max-w-xl mx-auto flex flex-col bg-zinc-900  p-6 md:p-8 rounded-lg justify-center items-center">
            <dt className="text-sm font-semibold leading-6 text-gray-300">
              Posições na 1ª página do Google
            </dt>
            <dd className="order-first text-xl sm:text-4xl font-bold tracking-tight text-white">
              <span>{content["stats_position"]}</span>
            </dd>
          </div>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden rounded-2xl text-center">
            <div className="flex flex-col bg-white/5 p-6 md:p-8 rounded-lg">
              <dt className="text-sm font-semibold leading-6 text-gray-300">
                Visualizações no Google
              </dt>
              <dd className="order-first text-xl sm:text-2xl font-semibold tracking-tight text-white">
                <span>{content["stats_views"]}</span>
              </dd>
            </div>
            <div className="flex flex-col bg-white/5 p-6 md:p-8 rounded-lg">
              <dt className="text-sm font-semibold leading-6 text-gray-300">Cliques no Site</dt>
              <dd className="order-first text-xl sm:text-2xl font-semibold tracking-tight text-white">
                <span>{content["stats_clicks"]}</span>
              </dd>
            </div>
            <div className="flex flex-col bg-white/5 p-6 md:p-8 rounded-lg">
              <dt className="text-sm font-semibold leading-6 text-gray-300">
                Imobiliárias parceiras
              </dt>
              <dd className="order-first text-xl sm:text-2xl font-semibold tracking-tight text-white">
                <span>{content["stats_partners"]}</span>
              </dd>
            </div>
            <div className="flex flex-col bg-white/5 p-6 md:p-8 rounded-lg">
              <dt className="text-sm font-semibold leading-6 text-gray-300">Imóveis Cadastrados</dt>
              <dd className="order-first text-xl sm:text-2xl font-semibold tracking-tight text-white">
                <span>
                  <span>{content["stats_properties"]}</span>
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
