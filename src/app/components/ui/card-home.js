import Image from "next/image";
import { ArrowLeftRight, BedDouble, Bath, CarFront } from "lucide-react";
import Link from "next/link";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { Share } from "./share";

export default function CardHome({
  Categoria,
  Codigo,
  TipoEndereco,
  Endereco,
  Empreendimento,
  Dormitorios,
  Suites,
  AreaPrivativa,
  Foto,
  Numero,
  ValorAntigo,
  ValorAluguelSite,
  Status,
  Situacao,
  MetragemAnt,
  DormitoriosAntigo,
  BanheiroSocialQtd,
  VagasAntigo,
}) {
  // Verificar se há fotos disponíveis
  const temFoto = Foto && Array.isArray(Foto) && Foto.length > 0;

  // Encontrar foto destacada ou usar a primeira foto
  const fotoDestacada = temFoto
    ? Foto.find((foto) => foto && foto.Destaque === "Sim") || Foto[0]
    : null;

  const urlFoto = fotoDestacada && fotoDestacada.Foto;
  const slug = formatterSlug(Empreendimento || "");

  const limitarTexto = (texto, limite) => {
    if (!texto) return "";
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + "...";
  };
  const descricaoLimitada = limitarTexto(Empreendimento, 45);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${Codigo}/${slug}`;
  const tituloCompartilhamento = `Confira este imóvel: ${descricaoLimitada}`;

  // Descrição limitada a 58 caracteres

  const formatterMoney = (value) => {
    return value.replace(/,\d{2}$/, '');
  }



  return (
    <div className="w-[350px] h-[400px] overflow-hidden flex flex-col">
      <Link href={`imovel-${Codigo}/${slug}`} className="flex flex-col h-full" target="_blank" rel="noopener noreferrer">
        {/* Header image with overlay */}
        <div className="relative h-[220px] flex-shrink-0">
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
          <div className="absolute top-4 right-4 bg-black/30 text-white text-[10px] font-semibold px-4 py-2 rounded">
            Cod: {Codigo}
          </div>
          <div className="absolute top-4 left-4 text-white text-[10px] font-semibold px-4 py-2 rounded">
            <Share
              url={url}
              title={tituloCompartilhamento}
              imovel={{
                Codigo,
                Empreendimento,
                BanheiroSocialQtd,
                Foto,
                Status,
                TipoEndereco,
                Endereco,
                ValorAntigo,
                Numero,
                Dormitorios,
                Suites,
                AreaPrivativa,

              }}
            />
          </div>

        </div>

        {/* Description Section */}
        <div className="p-6 bg-white flex-grow flex flex-col">
          <span className="text-xs text-gray-600 font-bold">{Categoria}</span>
          <h2 className="text-sm font-bold truncate">{descricaoLimitada}</h2>
          <span className="text-[11px] text-gray-600 font-semibold leading-snug line-clamp-2">
            {TipoEndereco} {Endereco}, {Numero}
          </span>

          {/* Icons section */}
          <div className="flex items-center gap-6 text-xs font-bold text-gray-800 mt-4">
            <div className="flex items-center gap-1">
              <ArrowLeftRight className="w-4 h-4" />
              {MetragemAnt} m²
            </div>
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              {DormitoriosAntigo}
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              {BanheiroSocialQtd}
            </div>
            <div className="flex items-center gap-1">
              <CarFront className="w-4 h-4" />
              {VagasAntigo}
            </div>
          </div>

          {/* Price and code */}
          <div className="flex justify-between items-center mt-auto pt-4">
            {Status === "LOCAÇÃO" && ValorAluguelSite !== "0" && ValorAluguelSite !== "" ? (
              <h3 className="text-base font-bold">R$ {ValorAluguelSite}</h3>
            ) : (
              <h3 className="text-base font-bold">R$ {formatterMoney(ValorAntigo)}</h3>
            )}

          </div>
        </div>
      </Link>
    </div>
  );
}
