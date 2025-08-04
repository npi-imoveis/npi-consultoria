import Image from "next/image";
import { HomeModernIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

import { Button } from "./button";
import { Share } from "./share";
import { formatterSlug } from "../../utils/formatter-slug";
import useImovelStore from "./../../store/imovelStore";
import { ArrowRightLeftIcon, Bath, Bed, CarIcon } from "lucide-react";
import { formatterValue } from "@/app/utils/formatter-value";

// Componente Skeleton para o CardImovel
export function CardImovelSkeleton() {
  return (
    <section className="w-[280px] h-full rounded-lg overflow-hidden bg-white flex flex-col shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
      {/* Imagem skeleton */}
      <div className="relative w-full aspect-[3/2] bg-gray-200 animate-pulse rounded-t-lg">
        <div className="absolute w-full top-2 flex justify-between px-2 py-1">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="w-20 h-5 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Conteúdo skeleton */}
      <div className="px-4 py-6 flex flex-col flex-grow">
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="w-2/3 h-5 bg-gray-300 rounded animate-pulse mb-6"></div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Botão skeleton */}
        <div className="mt-auto pt-4">
          <div className="w-full h-10 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

export default function CardImovel({
  nome,
  descricao,
  Empreendimento,
  BanheiroSocialQtd,
  VagasAntigo,
  Vagas,
  Codigo,
  Foto,
  Status,
  TipoEndereco,
  Endereco,
  ValorAntigo,
  ValorAluguelSite,
  Numero,
  DormitoriosAntigo,
  Dormitorios,
  Suites,
  AreaPrivativa,
  id,
  isLoading,
  target, // 🎯 NOVA PROP PARA CONTROLAR ABERTURA EM NOVA ABA
}) {
  // Se estiver carregando ou não houver código, mostra o skeleton
  if (isLoading || !Codigo) {
    return <CardImovelSkeleton />;
  }

  // Se houver dados, renderiza o componente completo
  const setImovelSelecionado = useImovelStore((state) => state.setImovelSelecionado);

  // Verificar se os valores existem para evitar erros
  const tipoEndereco = TipoEndereco || "";
  const endereco = Endereco || "";
  const numero = Numero || "";

  const enderecoCompleto = () => {
    return `${tipoEndereco} ${endereco}, ${numero}`;
  };

  const slug = formatterSlug(Empreendimento || "");

  // Função para limitar o texto a um número máximo de caracteres
  const limitarTexto = (texto, limite) => {
    if (!texto) return "";
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + "...";
  };

  // Descrição limitada a 58 caracteres
  const descricaoLimitada = limitarTexto(Empreendimento, 45);

  // Título para compartilhamento
  const tituloCompartilhamento = `Confira este imóvel: ${nome || descricaoLimitada}`;

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${Codigo}/${slug}`;

  // Função para lidar com o clique no botão
  const handleButtonClick = () => {
    // Armazenar o ID e slug no store e cookie
    setImovelSelecionado(Codigo, slug);
    document.cookie = `Codigo=${Codigo}; path=/`;
    document.cookie = `slug=${slug}; path=/`;
  };

  // Verificar se há fotos disponíveis
  const temFoto = Foto && Array.isArray(Foto) && Foto.length > 0;

  // Encontrar foto destacada ou usar a primeira foto
  const fotoDestacada = temFoto
    ? Foto.find((foto) => foto && foto.Destaque === "Sim") || Foto[0]
    : null;

  const urlFoto = fotoDestacada && fotoDestacada.Foto;

  const formatterMoney = (value) => {
    // Verificar se o valor existe e é uma string
    if (!value || typeof value !== "string") {
      return "";
    }
    return value.replace(/,\d{2}$/, "");
  };

  return (
    <section className="max-w-[350px] h-[420px] rounded-lg overflow-hidden bg-white flex flex-col shadow-[0px_0px_15px_rgba(0,0,0,0.09)] transition-transform duration-300 hover:shadow-[0px_0px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1">
      {/* Imagem de fundo com selo "Venda" */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-200">
        {urlFoto ? (
          <Image
            src={urlFoto}
            alt={Empreendimento}
            title={Empreendimento}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg transition-transform duration-500 ease-in-out group-hover:scale-110 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sem imagem disponível</span>
          </div>
        )}

        <div className="absolute w-full top-2 flex justify-between text-white text-xs md:text-sm font-semibold px-2 py-1 rounded">
          <Share
            url={url}
            title={tituloCompartilhamento}
            imovel={{
              Codigo,
              nome,
              Empreendimento,
              BanheiroSocialQtd,
              Foto,
              Status,
              TipoEndereco,
              Endereco,
              ValorAluguelSite,
              ValorAntigo,
              Numero,
              Dormitorios,
              Suites,
              AreaPrivativa,
              id,
            }}
          />
          <span className="text-[9px] bg-black/40 px-2 py-1 rounded ">Cod - {Codigo}</span>
        </div>
      </div>

      {/* Conteúdo abaixo da imagem */}
      <div className="px-4 py-6 flex flex-col flex-grow">
        <h2 className="text-[11px] font-semibold leading-4 break-words overflow-hidden text-zinc-600 truncate">
          {descricaoLimitada}
        </h2>
        {Status === "LOCAÇÃO" && ValorAluguelSite !== "0" && ValorAluguelSite !== "" ? (
          <h3 className="text-sm font-bold text-black mb-3 pt-2 truncate">
            {ValorAluguelSite ? formatterValue(ValorAluguelSite) : "Consultar Disponibilidade"}
          </h3>
        ) : (
          <h3 className="text-sm font-bold text-black mb-3 pt-2 truncate">
            {ValorAntigo !== "0"
              ? "R$ " + formatterMoney(ValorAntigo)
              : "Consultar Disponibilidade"}
          </h3>
        )}

        <ul className="space-y-2 text-[10px]">
          <li className="flex items-center space-x-2 overflow-hidden">
            <ArrowRightLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{AreaPrivativa || 0} m²</span>
          </li>
          <li className="flex items-center space-x-2 overflow-hidden">
            <Bed className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="truncate">
              {DormitoriosAntigo || Dormitorios} Dormitórios / {Suites || 0} Suítes
            </span>
          </li>

          <li className="flex items-center space-x-2 overflow-hidden">
            <CarIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{VagasAntigo || Vagas} Vagas</span>
          </li>
          <li className="flex items-center space-x-2 overflow-hidden border-t border-gray-200 pt-2">
            <BuildingOffice2Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="font-bold truncate">{enderecoCompleto()}</span>
          </li>
        </ul>

        {/* Botão de ação */}
        <div className="mt-auto pt-4  ">
          <Button
            link={`/imovel/${Codigo}/${slug}`}
            text="Saiba mais"
            onClick={handleButtonClick}
            target={target} // 🎯 PASSAR PROP TARGET PARA O BUTTON
          />
        </div>
      </div>
    </section>
  );
}
