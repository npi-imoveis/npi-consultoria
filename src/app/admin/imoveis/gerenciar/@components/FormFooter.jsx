"use client";

import { memo } from "react";
import { ArrowPathIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const FormFooter = ({ isSaving, isValid = true, isEditMode = false, onCancel }) => {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center mt-6">
      {!isValid && (
        <div className="flex items-center text-red-600">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          <p className="text-xs">
            Preencha todos os campos obrigatórios e adicione pelo menos 5 fotos para cadastrar o
            imóvel.
          </p>
        </div>
      )}

      <div className="flex ml-auto">
        <button
          type="button"
          onClick={onCancel || (() => router.push("/admin/automacao"))}
          className="inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 mr-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || !isValid}
          className={`inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white 
            ${
              isSaving
                ? "bg-gray-500"
                : !isValid
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
              {isEditMode ? "Atualizando..." : "Cadastrando..."}
            </>
          ) : isEditMode ? (
            "Atualizar Imóvel"
          ) : (
            "Cadastrar Imóvel"
          )}
        </button>
      </div>
    </div>
  );
};

export default memo(FormFooter);
