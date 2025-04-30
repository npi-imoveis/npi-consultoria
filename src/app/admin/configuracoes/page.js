"use client";

import { useState } from "react";
import AuthCheck from "../components/auth-check";

export default function Configuracoes() {
  const [formData, setFormData] = useState({
    nome_site: "NPI Imóveis",
    email_contato: "npi@npiconsultoria.com.br",
    telefone: "(11) 2614-4414",
    endereco: "Rua George Ohm, 206P",
    whatsapp: "(11)96915-2222",
    instagram: "@npiimoveis",
    facebook: "facebook.com/npiimoveis",
    imoveis_por_pagina: "12",
    meta_description: "NPI Imóveis - Encontre seu imóvel ideal em São Paulo e região",
    google_analytics: "UA-12345678-1",
    cores: {
      primaria: "#000000",
      secundaria: "#2563EB",
      destaque: "#FBBF24",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Verificar se é um campo aninhado (cores)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de salvamento
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);

    // Em uma implementação real, você enviaria os dados para a API
  };

  return (
    <AuthCheck>
      <div className="w-full mx-auto text-xs">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Configurações do Site</h1>
          <p className="text-gray-600 mb-6">
            Configure as informações gerais do site, contato e aparência.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Gerais */}
            <div className="bg-white  rounded-lg overflow-hidden p-6">
              <h2 className="font-semibold mb-4 text-gray-800 border-b pb-2">Informações Gerais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nome_site" className="block font-medium text-gray-700 mb-1">
                    Nome do Site
                  </label>
                  <input
                    type="text"
                    id="nome_site"
                    name="nome_site"
                    value={formData.nome_site}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="meta_description"
                    className="block font-medium text-gray-700 mb-1"
                  >
                    Meta Description
                  </label>
                  <input
                    type="text"
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="imoveis_por_pagina"
                    className="block font-medium text-gray-700 mb-1"
                  >
                    Imóveis por Página
                  </label>
                  <input
                    type="number"
                    id="imoveis_por_pagina"
                    name="imoveis_por_pagina"
                    value={formData.imoveis_por_pagina}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="google_analytics"
                    className="block font-medium text-gray-700 mb-1"
                  >
                    ID do Google Analytics
                  </label>
                  <input
                    type="text"
                    id="google_analytics"
                    name="google_analytics"
                    value={formData.google_analytics}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white  rounded-lg overflow-hidden p-6">
              <h2 className="font-semibold mb-4 text-gray-800 border-b pb-2">Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email_contato" className="block font-medium text-gray-700 mb-1">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    id="email_contato"
                    name="email_contato"
                    value={formData.email_contato}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label htmlFor="telefone" className="block font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label htmlFor="endereco" className="block font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-white  rounded-lg overflow-hidden p-6">
              <h2 className="font-semibold mb-4 text-gray-800 border-b pb-2">Redes Sociais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="instagram" className="block font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label htmlFor="facebook" className="block font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="text"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center px-5 py-2 border border-transparent font-medium rounded-md shadow-sm text-white ${
                  isLoading ? "bg-gray-500" : "bg-black hover:bg-gray-800"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
              >
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </button>
            </div>

            {/* Mensagem de sucesso */}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-green-700">Configurações salvas com sucesso!</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AuthCheck>
  );
}
