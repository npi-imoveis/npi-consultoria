// app/venda-seu-imovel/components/ImovelFormClient.js
"use client";

import React, { useState, useRef } from "react";
import { HeaderPage } from "../../components/ui/header-page";
import { Footer } from "../../components/ui/footer";
import Image from "next/image";
import { getImageUploadMetadata, uploadToS3 } from "../../utils/s3-upload";
import { PhotoIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function ImovelFormClient() {
  const [formState, setFormState] = useState("form"); // estados: "form", "loading", "success"
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipoImovel: "",
    acao: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    valorImovel: "",
    valorCondominio: "",
    valorIptu: "",
    descricao: "",
  });
  // Estado para gerenciar as imagens temporárias
  const [imagensTemporarias, setImagensTemporarias] = useState([]);
  const [errors, setErrors] = useState({
    nome: false,
    email: false,
    telefone: false,
    tipoImovel: false,
    acao: false,
    cep: false,
    endereco: false,
    numero: false,
    bairro: false,
    cidade: false,
    estado: false,
    valorImovel: false,
    valorCondominio: false,
    valorIptu: false,
    descricao: false,
    imagens: false,
  });
  const fileInputRef = useRef(null);

  // Função para formatar número de telefone
  const formatarTelefone = (valor) => {
    const numerosApenas = valor.replace(/\D/g, "");
    const numeroLimitado = numerosApenas.slice(0, 11);

    if (numeroLimitado.length <= 2) {
      return numeroLimitado;
    } else if (numeroLimitado.length <= 7) {
      return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2)}`;
    } else {
      return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 7)}-${numeroLimitado.slice(
        7
      )}`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefone") {
      setFormData((prev) => ({
        ...prev,
        [name]: formatarTelefone(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarFormulario = () => {
    const novosErros = {
      nome: !formData.nome.trim(),
      email: !formData.email.trim() || !validarEmail(formData.email),
      telefone: !formData.telefone.trim() || formData.telefone.replace(/\D/g, "").length < 10,
      tipoImovel: !formData.tipoImovel,
      acao: !formData.acao,
      cep: !formData.cep.trim(),
      endereco: !formData.endereco.trim(),
      numero: !formData.numero.trim(),
      bairro: !formData.bairro.trim(),
      cidade: !formData.cidade.trim(),
      estado: !formData.estado,
      valorImovel: !formData.valorImovel.trim(),
      valorCondominio: !formData.valorCondominio.trim(),
      valorIptu: !formData.valorIptu.trim(),
      descricao: !formData.descricao.trim(),
      imagens: imagensTemporarias.length === 0,
    };

    setErrors(novosErros);
    return !Object.values(novosErros).some((erro) => erro);
  };

  // Função para lidar com a adição de imagens
  const handleAddImages = (files) => {
    if (!files || files.length === 0) return;

    // Converter FileList para array e criar URLs temporárias
    const novasImagens = Array.from(files).map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      isUploading: false,
      altText: `Foto ${index + 1} do imóvel cadastrado para venda ou locação`, // ✅ ALT TEXT SEO
    }));

    setImagensTemporarias((prev) => [...prev, ...novasImagens]);
    // Limpar erro de imagens se existir
    if (errors.imagens) {
      setErrors((prev) => ({ ...prev, imagens: false }));
    }
  };

  // Função para remover imagem da lista
  const removerImagem = (id) => {
    setImagensTemporarias((prev) => prev.filter((img) => img.id !== id));
  };

  // Função para lidar com arquivos arrastados
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddImages(e.dataTransfer.files);
    }
  };

  // Função para selecionar arquivos via input
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddImages(e.target.files);
      // Limpar o input para permitir selecionar os mesmos arquivos novamente
      e.target.value = "";
    }
  };

  // Função para fazer upload das imagens para o S3
  const uploadImages = async () => {
    try {
      const uploadPromises = imagensTemporarias.map(async (imagem) => {
        try {
          const metadata = await getImageUploadMetadata(imagem.file);
          await uploadToS3(metadata);
          return metadata.fileUrl;
        } catch (error) {
          console.error(`Erro ao fazer upload da imagem ${imagem.id}:`, error);
          throw error;
        }
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
      throw new Error("Falha ao enviar uma ou mais imagens");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (validarFormulario()) {
      setFormState("loading");

      try {
        // Fazer upload das imagens para o S3
        const imageUrls = await uploadImages();

        import("@emailjs/browser").then((emailjs) => {
          emailjs.default
            .send(
              "service_az9rp6u",
              "template_p8hi73i",
              {
                name: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                tipoImovel: formData.tipoImovel,
                acao: formData.acao,
                cep: formData.cep,
                endereco: formData.endereco,
                numero: formData.numero,
                complemento: formData.complemento,
                bairro: formData.bairro,
                cidade: formData.cidade,
                estado: formData.estado,
                valorImovel: formData.valorImovel,
                valorCondominio: formData.valorCondominio,
                valorIptu: formData.valorIptu,
                descricao: formData.descricao,
                imagensUrls: imageUrls.join(", "),
              },
              "sraRHEjyadY96d2x1"
            )
            .then(() => {
              setFormState("success");
              // Limpar o formulário após o sucesso
              setFormData({
                nome: "",
                email: "",
                telefone: "",
                tipoImovel: "",
                acao: "",
                cep: "",
                endereco: "",
                numero: "",
                complemento: "",
                bairro: "",
                cidade: "",
                estado: "",
                valorImovel: "",
                valorCondominio: "",
                valorIptu: "",
                descricao: "",
              });
              setImagensTemporarias([]);
            })
            .catch((error) => {
              console.error("Erro ao enviar mensagem:", error);
              setFormState("form");
              alert("Erro ao enviar mensagem. Por favor, tente novamente.");
            });
        });
      } catch (error) {
        console.error("Erro no processo de envio:", error);
        setFormState("form");
        alert("Erro ao processar as imagens. Por favor, tente novamente.");
      }
    }
  };

  return (
    <section>
      <HeaderPage
        title="Cadastre seu imóvel para venda ou locação gratuitamente"
        description="Formulário completo e seguro para cadastro do seu imóvel. Nossa equipe especializada fará a avaliação e cuidará de todo o processo de venda ou locação."
        image="/assets/images/imoveis/02.jpg"
      />
      
      <div className="container mx-auto px-4 py-16">
        {/* ✅ CONTEÚDO SEO ADICIONAL */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Venda ou Alugue seu Imóvel com Segurança
          </h1>
          <div className="prose max-w-none text-gray-600">
            <p className="text-lg mb-4">
              Cadastre gratuitamente seu <strong>apartamento, casa ou imóvel comercial</strong> para venda ou locação. 
              Nossa equipe especializada oferece <strong>avaliação gratuita</strong>, fotografia profissional, 
              marketing digital avançado e acompanhamento completo durante todo o processo.
            </p>
            <p className="mb-4">
              A NPI Consultoria possui mais de <strong>10 anos de experiência</strong> no mercado imobiliário, 
              com centenas de negócios realizados. Oferecemos <strong>assessoria jurídica</strong>, 
              <strong>estratégias de precificação</strong> e <strong>marketing em múltiplas plataformas</strong> 
              para garantir a melhor exposição do seu imóvel.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Por que escolher a NPI Consultoria?
              </h2>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Avaliação de mercado precisa e gratuita</li>
                <li>Fotografia profissional inclusa</li>
                <li>Marketing digital em todas as principais plataformas</li>
                <li>Acompanhamento jurídico completo</li>
                <li>Negociação especializada</li>
                <li>Suporte até a conclusão do negócio</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="py-4 bg-yellow-50 px-4 rounded-lg mb-6">
          <strong>💡 Dicas importantes:</strong> Fotos na posição horizontal com todas as luzes acesas, 
          incluindo fotos de todos os ambientes, área de lazer e fachada, valorizam significativamente 
          o anúncio do seu imóvel e atraem mais interessados.
        </p>

        {formState === "form" && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Preencha os dados do seu imóvel
              </h2>
              <p className="text-gray-600">
                Todos os campos marcados com * são obrigatórios. 
                Quanto mais informações você fornecer, melhor será nossa avaliação.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  id="nome"
                  className={`border rounded py-2 px-3 w-full ${errors.nome ? "border-red-500" : ""}`}
                  placeholder="Seu nome completo*"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe seu nome completo</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="seu@email.com*"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe um e-mail válido</p>
                )}
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  id="telefone"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.telefone ? "border-red-500" : ""
                  }`}
                  placeholder="(11) 99999-9999*"
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                />
                {errors.telefone && (
                  <p className="text-red-500 text-xs mt-1">
                    Por favor, informe um telefone válido com DDD
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="tipoImovel" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de imóvel
                </label>
                <select
                  id="tipoImovel"
                  className={`border rounded py-2 px-3 w-full bg-white ${
                    errors.tipoImovel ? "border-red-500" : ""
                  }`}
                  name="tipoImovel"
                  value={formData.tipoImovel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione o tipo*</option>
                  <option>Apartamento</option>
                  <option>Casa</option>
                  <option>Terreno</option>
                  <option>Cobertura</option>
                  <option>Sobrado</option>
                  <option>Kitnet/Studio</option>
                </select>
                {errors.tipoImovel && (
                  <p className="text-red-500 text-xs mt-1">Por favor, selecione o tipo de imóvel</p>
                )}
              </div>

              <div>
                <label htmlFor="acao" className="block text-sm font-medium text-gray-700 mb-1">
                  Objetivo
                </label>
                <select
                  id="acao"
                  className={`border rounded py-2 px-3 w-full bg-white ${
                    errors.acao ? "border-red-500" : ""
                  }`}
                  name="acao"
                  value={formData.acao}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">O que deseja fazer?*</option>
                  <option>Venda</option>
                  <option>Locação</option>
                  <option>Venda ou Locação</option>
                </select>
                {errors.acao && (
                  <p className="text-red-500 text-xs mt-1">Por favor, selecione a ação desejada</p>
                )}
              </div>

              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  id="cep"
                  className={`border rounded py-2 px-3 w-full ${errors.cep ? "border-red-500" : ""}`}
                  placeholder="00000-000*"
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  required
                />
                {errors.cep && <p className="text-red-500 text-xs mt-1">Por favor, informe o CEP</p>}
              </div>

              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  id="endereco"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.endereco ? "border-red-500" : ""
                  }`}
                  placeholder="Rua, avenida...*"
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  required
                />
                {errors.endereco && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe o endereço</p>
                )}
              </div>

              <div>
                <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  id="numero"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.numero ? "border-red-500" : ""
                  }`}
                  placeholder="Número*"
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  required
                />
                {errors.numero && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe o número</p>
                )}
              </div>

              <div>
                <label htmlFor="complemento" className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  id="complemento"
                  className="border rounded py-2 px-3 w-full"
                  placeholder="Apto, bloco... (opcional)"
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  id="bairro"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.bairro ? "border-red-500" : ""
                  }`}
                  placeholder="Nome do bairro*"
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  required
                />
                {errors.bairro && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe o bairro</p>
                )}
              </div>

              <div>
                <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  id="cidade"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.cidade ? "border-red-500" : ""
                  }`}
                  placeholder="Nome da cidade*"
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  required
                />
                {errors.cidade && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe a cidade</p>
                )}
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="estado"
                  className={`border rounded py-2 px-3 w-full bg-white ${
                    errors.estado ? "border-red-500" : ""
                  }`}
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione o estado*</option>
                  <option>São Paulo</option>
                  <option>Rio de Janeiro</option>
                  <option>Minas Gerais</option>
                  <option>Outro Estado</option>
                </select>
                {errors.estado && (
                  <p className="text-red-500 text-xs mt-1">Por favor, selecione o estado</p>
                )}
              </div>

              <div>
                <label htmlFor="valorImovel" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do imóvel
                </label>
                <input
                  id="valorImovel"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.valorImovel ? "border-red-500" : ""
                  }`}
                  placeholder="Valor desejado (R$)*"
                  type="number"
                  name="valorImovel"
                  value={formData.valorImovel}
                  onChange={handleInputChange}
                  required
                />
                {errors.valorImovel && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe o valor do imóvel</p>
                )}
              </div>

              <div>
                <label htmlFor="valorCondominio" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do condomínio
                </label>
                <input
                  id="valorCondominio"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.valorCondominio ? "border-red-500" : ""
                  }`}
                  placeholder="Valor mensal (R$)*"
                  type="number"
                  name="valorCondominio"
                  value={formData.valorCondominio}
                  onChange={handleInputChange}
                  required
                />
                {errors.valorCondominio && (
                  <p className="text-red-500 text-xs mt-1">
                    Por favor, informe o valor do condomínio
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="valorIptu" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do IPTU
                </label>
                <input
                  id="valorIptu"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.valorIptu ? "border-red-500" : ""
                  }`}
                  placeholder="Valor anual (R$)*"
                  type="number"
                  name="valorIptu"
                  value={formData.valorIptu}
                  onChange={handleInputChange}
                  required
                />
                {errors.valorIptu && (
                  <p className="text-red-500 text-xs mt-1">Por favor, informe o valor do IPTU</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição detalhada do imóvel
                </label>
                <textarea
                  id="descricao"
                  className={`border rounded py-2 px-3 w-full ${
                    errors.descricao ? "border-red-500" : ""
                  }`}
                  placeholder="Descreva seu imóvel com o máximo de detalhes: número de quartos, banheiros, vagas, área, diferenciais, reformas, proximidade a comércios, transporte público, etc.*"
                  rows={4}
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  required
                />
                {errors.descricao && (
                  <p className="text-red-500 text-xs mt-1">
                    Por favor, forneça uma descrição detalhada do imóvel
                  </p>
                )}
              </div>

              <div className="sm:col-span-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Fotos do imóvel
                </h3>
                <div className="w-full mx-auto py-4">
                  <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      📸 Dicas para fotos que vendem:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Fotos horizontais com todas as luzes acesas</li>
                      <li>• Inclua todos os ambientes: sala, quartos, cozinha, banheiros</li>
                      <li>• Fotografe área de lazer, fachada e vista da sacada</li>
                      <li>• Evite objetos pessoais nas fotos</li>
                      <li>• Tire fotos durante o dia para melhor iluminação</li>
                    </ul>
                  </div>

                  <div
                    className={`border-2 border-dashed ${
                      errors.imagens ? "border-red-500" : "border-gray-300"
                    } rounded-md p-6 flex flex-col items-center justify-center text-center`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600 font-medium">Arraste e solte as fotos aqui</p>
                    <p className="text-gray-500 my-2">ou</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#8B6F48] text-white py-2 px-4 rounded font-medium hover:bg-[#7a5f3a] transition-colors"
                    >
                      Escolher arquivos
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      style={{ display: "none" }}
                    />
                    {errors.imagens && (
                      <p className="text-red-500 text-xs mt-2">
                        Por favor, adicione pelo menos uma imagem do imóvel
                      </p>
                    )}
                  </div>

                  {/* Visualização das imagens selecionadas */}
                  {imagensTemporarias.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-700 mb-4">
                        Imagens selecionadas ({imagensTemporarias.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagensTemporarias.map((imagem, index) => (
                          <div
                            key={imagem.id}
                            className="relative group bg-gray-100 rounded-md overflow-hidden"
                          >
                            <div className="relative h-40 w-full">
                              <Image
                                src={imagem.previewUrl}
                                alt={`Foto ${index + 1} do imóvel para venda ou locação`} // ✅ ALT TEXT SEO
                                fill
                                style={{ objectFit: "contain" }}
                                loading="lazy"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removerImagem(imagem.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                              aria-label={`Remover foto ${index + 1}`}
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full bg-[#8B6F48] text-white py-3 rounded font-semibold hover:bg-[#7a5f3a] transition-colors text-lg"
                >
                  🏠 Cadastrar meu imóvel gratuitamente
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Ao cadastrar, você aceita que nossa equipe entre em contato para agendar uma avaliação gratuita.
                </p>
              </div>
            </form>
          </>
        )}

        {formState === "loading" && (
          <div
            className="flex flex-col items-center justify-center mt-8 h-40"
            aria-live="polite"
            aria-busy="true"
          >
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B6F48]"
              role="status"
            >
              <span className="sr-only">Enviando dados do imóvel...</span>
            </div>
            <p className="mt-4 text-gray-600">Processando informações do seu imóvel...</p>
          </div>
        )}

        {formState === "success" && (
          <div className="flex flex-col items-center justify-center mt-8 h-40" aria-live="polite">
            <div className="text-center bg-green-50 p-8 rounded-lg">
              <p className="text-2xl font-bold text-green-700 mb-2">
                ✅ Imóvel cadastrado com sucesso!
              </p>
              <p className="text-gray-700 mb-4">
                Recebemos todas as informações do seu imóvel.
              </p>
              <p className="text-sm text-gray-600">
                Nossa equipe especializada entrará em contato em até 24 horas para agendar 
                uma <strong>avaliação gratuita</strong> e iniciar o processo de venda ou locação.
              </p>
            </div>
          </div>
        )}

        {/* ✅ CONTEÚDO SEO ADICIONAL INFERIOR */}
        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sobre nossos serviços de venda e locação
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-600">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processo de Venda</h3>
              <p className="mb-3">
                Nossa metodologia comprovada inclui análise de mercado, definição de preço estratégico,
                marketing multicanal e negociação especializada. Cuidamos de toda a documentação
                e acompanhamos o processo até a escritura.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Avaliação gratuita por corretor especializado</li>
                <li>• Fotografia profissional e tour virtual</li>
                <li>• Anúncios em +20 portais imobiliários</li>
                <li>• Marketing nas redes sociais</li>
                <li>• Acompanhamento jurídico</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processo de Locação</h3>
              <p className="mb-3">
                Especializados em locação residencial e comercial, oferecemos análise de inquilinos,
                contratos seguros e gestão completa da locação. Garantimos tranquilidade para
                proprietários e locatários.
              </p>
              <ul className="text-sm space-y-1">
                <li>• Análise criteriosa de inquilinos</li>
                <li>• Contratos com garantias adequadas</li>
                <li>• Gestão de pagamentos e vistoria</li>
                <li>• Suporte jurídico especializado</li>
                <li>• Relatórios mensais para proprietários</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}
