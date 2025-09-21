import Image from "next/image";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { Share } from "./share";
import { formatterSlug } from "../../utils/formatter-slug";
import useImovelStore from "./../../store/imovelStore";
import { ArrowRightLeftIcon, Bed, CarIcon } from "lucide-react";
import { formatterValue } from "@/app/utils/formatter-value";


/* ================= Skeleton ================= */
export function CardImovelSkeleton() {
  return (
    <section className="w-[280px] h-full rounded-lg overflow-hidden bg-white flex flex-col shadow-[0px_0px_15px_rgba(0,0,0,0.09)]">
      <div className="relative w-full aspect-[3/2] bg-gray-200 animate-pulse rounded-t-lg">
        <div className="absolute w-full top-2 flex justify-between px-2 py-1">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="w-20 h-5 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
      <div className="px-4 py-6 flex flex-col flex-grow">
        <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="w-2/3 h-5 bg-gray-300 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="w-full h-10 bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>
    // Dentro da função/página onde monta os cards (antes do return)
console.log("imoveis recebidos para os cards:", imoveis);
    </section>
  );
}

/* ================= Helpers ================= */
const normalize = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const isLocacao = (status) => {
  const n = normalize(status);
  return (n.includes("loca") || n.includes("alug"));
};

const stripCents = (v) => String(v || "").replace(/,\d{2}$/, "");

const fotoUrlFrom = (Foto) => {
  if (!Foto) return null;
  if (Array.isArray(Foto) && Foto.length > 0) {
    const destaque =
      Foto.find((f) => {
        if (!f) return false;
        if (typeof f === "string") return false;
        const d = normalize(f.Destaque || f.destaque);
        return d === "sim" || d === "true" || d === "1";
      }) || Foto[0];

    if (typeof destaque === "string") return destaque;
    return destaque?.Foto || destaque?.foto || null;
  }
  if (typeof Foto === "string") return Foto;
  return null;
};

const enderecoFormatado = (tipo, logradouro, numero) => {
  const t = tipo ? String(tipo).trim() : "";
  const e = logradouro ? String(logradouro).trim() : "";
  const n = numero ? String(numero).trim() : "";
  return [t && `${t}`, e, n && `${n}`].filter(Boolean).join(" ");
};

/* ================= Card ================= */
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
  ValorAluguel,
  Aluguel,
  ValorLocacao,
  Numero,
  DormitoriosAntigo,
  Dormitorios,
  Suites,
  AreaPrivativa,
  id,
  isLoading,
  target,
}) {
  // DEBUG!
  console.log("==== CARDIMOVEL PROPS ====", { Codigo, Status, ValorAluguelSite, ValorAluguel, Aluguel, ValorLocacao, Foto });

  if (isLoading || !Codigo) {
    return <CardImovelSkeleton />;
  }

  const setImovelSelecionado = useImovelStore((state) => state.setImovelSelecionado);

  const enderecoStr = enderecoFormatado(TipoEndereco, Endereco, Numero);
  const slug = formatterSlug(Empreendimento || descricao || nome || "");

  const limitar = (t, n) => (t ? (t.length <= n ? t : `${t.slice(0, n)}...`) : "");
  const titulo = limitar(Empreendimento || descricao || nome, 45);

  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const shareUrl = `${base}/imovel/${Codigo}/${slug}`;
  const tituloCompartilhamento = `Confira este imóvel: ${nome || titulo}`;

  const handleButtonClick = () => {
    setImovelSelecionado(Codigo, slug);
    document.cookie = `Codigo=${Codigo}; path=/`;
    document.cookie = `slug=${slug}; path=/`;
  };

  const urlFoto = fotoUrlFrom(Foto);

  const ehLocacao = isLocacao(Status);

  // Tenta todos os campos possíveis de aluguel
  const aluguelRaw =
    ValorAluguelSite || ValorAluguel || Aluguel || ValorLocacao || null;

  const aluguelFmt = aluguelRaw ? formatterValue(aluguelRaw) : null;
  const vendaFmt =
    ValorAntigo && ValorAntigo !== "0" ? `R$ ${stripCents(ValorAntigo)}` : null;

  const valorPrincipal =
    ehLocacao ? (aluguelFmt || "Consultar Disponibilidade") : (vendaFmt || "Consultar Disponibilidade");

  return (
    <section className="max-w-[350px] h-[420px] rounded-lg overflow-hidden bg-white flex flex-col shadow-[0px_0px_15px_rgba(0,0,0,0.09)] transition-transform duration-300 hover:shadow-[0px_0px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1">
      {/* Imagem */}
      <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-200">
        {urlFoto ? (
          <Image
            src={urlFoto}
            alt={Empreendimento || titulo || `Imóvel ${Codigo}`}
            title={Empreendimento || titulo || `Imóvel ${Codigo}`}
            fill
            sizes="(max-width: 768px) 100vw, 350px"
            priority={false}
            style={{ objectFit: "cover" }}
            className="rounded-t-lg transition-transform duration-500 ease-in-out group-hover:scale-110 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sem imagem disponível</span>
          </div>
        )}

        <div className="absolute w-full top-2 flex justify-between text-white text-xs md:text-sm font-semibold px-2 py-1 rounded">
          <Share
            url={shareUrl}
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
          <span className="text-[9px] bg-black/40 px-2 py-1 rounded">Cod - {Codigo}</span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-6 flex flex-col flex-grow">
        <h2 className="text-[11px] font-semibold leading-4 break-words overflow-hidden text-zinc-600 truncate">
          {titulo}
        </h2>

        <h3 className="text-sm font-bold text-black mb-3 pt-2 truncate">
          {valorPrincipal}
        </h3>

        <ul className="space-y-2 text-[10px]">
          <li className="flex items-center space-x-2 overflow-hidden">
            <ArrowRightLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{AreaPrivativa || 0} m²</span>
          </li>
          <li className="flex items-center space-x-2 overflow-hidden">
            <Bed className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="truncate">
              {(DormitoriosAntigo ?? Dormitorios ?? 0)} Dormitórios / {(Suites ?? 0)} Suítes
            </span>
          </li>
          <li className="flex items-center space-x-2 overflow-hidden">
            <CarIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{(VagasAntigo ?? Vagas ?? 0)} Vagas</span>
          </li>
          <li className="flex items-center space-x-2 overflow-hidden border-t border-gray-200 pt-2">
            <BuildingOffice2Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-500 flex-shrink-0" />
            <span className="font-bold truncate">{enderecoStr}</span>
          </li>
        </ul>

        <div className="mt-auto pt-4">
          <Button
            link={`/imovel/${Codigo}/${slug}`}
            text="Saiba mais"
            onClick={handleButtonClick}
            target={target}
          />
        </div>
      </div>
    </section>
  );
}
