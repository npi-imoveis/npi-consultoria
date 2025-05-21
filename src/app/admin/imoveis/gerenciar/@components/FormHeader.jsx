"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const FormHeader = ({
  title,
  subtitle,
  isEditMode = false,
  propertyName = "",
  isAutomacao = false,
}) => {
  const router = useRouter();

  const displayTitle =
    isEditMode && propertyName ? `Editar Imóvel: ${propertyName}` : "Cadastrar Novo Imóvel";

  const link = isAutomacao ? `/admin/automacao` : `/admin/imoveis`;

  return (
    <div className="py-2 border-b border-gray-200">
      <div className="flex items-center mb-2">
        <button
          type="button"
          onClick={() => router.push(link)}
          className="mr-2 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-semibold">{title || displayTitle}</h1>
      </div>
      {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
    </div>
  );
};

export default FormHeader;
