import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      {/* Coloque aqui seu logo ou animação */}
      <Image
        src="/assets/images/logo_light.png"
        alt="Logo da Empresa"
        width={350}
        height={350}
        className="w-32 h-32"
      />
    </div>
  );
}
