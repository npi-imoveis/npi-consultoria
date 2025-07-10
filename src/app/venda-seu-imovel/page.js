// app/venda-seu-imovel/VendaSeuImovelClient.js
"use client";

import React, { useState, useRef } from "react";
import { HeaderPage } from "../components/ui/header-page";
import { Footer } from "../components/ui/footer";
import Image from "next/image";
import { getImageUploadMetadata, uploadToS3 } from "../utils/s3-upload";
import { PhotoIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function VendaSeuImovelClient() {
  const [formState, setFormState] = useState("form");
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

  const formatarTelefone = (valor) => {
    const numerosApenas = valor.replace(/\D/g, "");
    const numeroLimitado = numerosApenas.slice(0, 11);

    if (numeroLimitado.length <= 2) {
      return numeroLimitado;
    } else if (numeroLimitado.length <= 7) {
      return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2)}`;
    } else {
      return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 7)}-${numeroLimitado.slice(7)}`;
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

  const handleAddImages = (files) => {
    if (!files || files.length === 0) return;

    const novasImagens = Array.from(files).map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      isUploading: false,
    }));

    setImagensTemporarias((prev) => [...prev, ...novasImagens]);
    if (errors.imagens) {
      setErrors((prev) => ({ ...prev, imagens: false }));
    }
  };

  const removerImagem = (id) => {
    setImagensTemporarias((prev) => prev.filter((img) => img.id !== id));
  };

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

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddImages(e.target.files);
      e.target.value = "";
    }
  };

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
    <>
      <HeaderPage
        title="Venda ou alugue seu imóvel com assessoria completa"
        description="Cadastre gratuitamente seu imóvel e receba avaliação profissional, marketing em múltiplos portais e acompanhamento até a venda."
        image="/assets/images/imoveis/02.jpg"
      />
      
      <main className="container mx-auto px-4 py-16">
        {/* ✅ ÚNICO H1 NA PÁGINA */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Venda ou Alugue seu Imóvel com Avaliação Gratuita
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            <strong>Cadastre gratuitamente</strong> seu apartamento, casa ou imóvel comercial. 
            Nossa equipe especializada oferece <strong>avaliação profissional</strong>, 
            marketing em mais de 20 portais e <strong>acompanhamento completo</strong> até a venda ou locação.
          </p>
        </header>

        {/* ✅ SEÇÃO DE BENEFÍCIOS */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Por que escolher a NPI Consultoria?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Avaliação Gratuita</h3>
                <p className="text-gray-600 text-sm">Análise de mercado precisa por corretor especializado</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📸</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Marketing Completo</h3>
                <p className="text-gray-600 text-sm">Fotografia profissional e anúncios em +20 portais</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Suporte Completo</h3>
                <p className="text-gray-600 text-sm">Acompanhamento jurídico e negociação especializada</p>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ DICAS DE FOTOGRAFIA */}
        <aside className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Dicas para fotos que vendem mais
            </h2>
            <ul className="text-yellow-700 space-y-2 text-sm">
              <li>• <strong>Fotos horizontais</strong> com todas as luzes acesas durante o dia</li>
              <li>• <strong>Inclua todos os ambientes:</strong> sala, quartos, cozinha, banheiros</li>
              <li>• <strong>Fotografe áreas extras:</strong> sacada, área de lazer, fachada do prédio</li>
              <li>• <strong>Organize o ambiente:</strong> evite objetos pessoais e desarrumação</li>
              <li>• <strong>Destaque diferenciais:</strong> vista, acabamentos, armários planejados</li>
            </ul>
          </div>
        </aside>

        {formState === "form" && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Cadastre seu imóvel gratuitamente
              </h2>
              <p className="text-gray-600">
                Preencha as informações abaixo. Quanto mais detalhes você fornecer, 
                melhor será nossa avaliação e estratégia de venda ou locação.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* ✅ DADOS PESSOAIS */}
              <fieldset className="sm:col-span-3">
                <legend className="text-lg font-semibold text-gray-800 mb-4">Seus dados de contato</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo *
                    </label>
                    <input
                      id="nome"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.nome ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Seu nome completo"
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
                      E-mail *
                    </label>
                    <input
                      id="email"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="seu@email.com"
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
                      Telefone *
                    </label>
                    <input
                      id="telefone"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.telefone ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="(11) 99999-9999"
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
                </div>
              </fieldset>

              {/* ✅ DADOS DO IMÓVEL */}
              <fieldset className="sm:col-span-3">
                <legend className="text-lg font-semibold text-gray-800 mb-4">Informações do imóvel</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="tipoImovel" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de imóvel *
                    </label>
                    <select
                      id="tipoImovel"
                      className={`border rounded-lg py-3 px-4 w-full bg-white ${errors.tipoImovel ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      name="tipoImovel"
                      value={formData.tipoImovel}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option>Apartamento</option>
                      <option>Casa</option>
                      <option>Terreno</option>
                      <option>Cobertura</option>
                      <option>Sobrado</option>
                      <option>Kitnet/Studio</option>
                      <option>Loft</option>
                      <option>Comercial</option>
                    </select>
                    {errors.tipoImovel && (
                      <p className="text-red-500 text-xs mt-1">Por favor, selecione o tipo de imóvel</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="acao" className="block text-sm font-medium text-gray-700 mb-1">
                      O que deseja fazer? *
                    </label>
                    <select
                      id="acao"
                      className={`border rounded-lg py-3 px-4 w-full bg-white ${errors.acao ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      name="acao"
                      value={formData.acao}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione a ação</option>
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
                      CEP *
                    </label>
                    <input
                      id="cep"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.cep ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="00000-000"
                      type="text"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.cep && <p className="text-red-500 text-xs mt-1">Por favor, informe o CEP</p>}
                  </div>
                </div>
              </fieldset>

              {/* ✅ ENDEREÇO */}
              <fieldset className="sm:col-span-3">
                <legend className="text-lg font-semibold text-gray-800 mb-4">Endereço completo</legend>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                      Logradouro *
                    </label>
                    <input
                      id="endereco"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.endereco ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Rua, avenida, praça..."
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
                      Número *
                    </label>
                    <input
                      id="numero"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.numero ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="123"
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
                      className="border rounded-lg py-3 px-4 w-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Apto 12B (opcional)"
                      type="text"
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      id="bairro"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.bairro ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Nome do bairro"
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
                      Cidade *
                    </label>
                    <input
                      id="cidade"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.cidade ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Nome da cidade"
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
                      Estado *
                    </label>
                    <select
                      id="estado"
                      className={`border rounded-lg py-3 px-4 w-full bg-white ${errors.estado ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione</option>
                      <option>São Paulo</option>
                      <option>Rio de Janeiro</option>
                      <option>Minas Gerais</option>
                      <option>Outro Estado</option>
                    </select>
                    {errors.estado && (
                      <p className="text-red-500 text-xs mt-1">Por favor, selecione o estado</p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* ✅ VALORES */}
              <fieldset className="sm:col-span-3">
                <legend className="text-lg font-semibold text-gray-800 mb-4">Valores do imóvel</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="valorImovel" className="block text-sm font-medium text-gray-700 mb-1">
                      Valor desejado (R$) *
                    </label>
                    <input
                      id="valorImovel"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.valorImovel ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="500000"
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
                      Condomínio mensal (R$) *
                    </label>
                    <input
                      id="valorCondominio"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.valorCondominio ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="800"
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
                      IPTU anual (R$) *
                    </label>
                    <input
                      id="valorIptu"
                      className={`border rounded-lg py-3 px-4 w-full ${errors.valorIptu ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="2500"
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
                </div>
              </fieldset>

              {/* ✅ DESCRIÇÃO */}
              <div className="sm:col-span-3">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição completa do imóvel *
                </label>
                <textarea
                  id="descricao"
                  className={`border rounded-lg py-3 px-4 w-full ${errors.descricao ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Descreva detalhadamente: número de quartos, banheiros, vagas, área aproximada, diferenciais (sacada, churrasqueira, armários), reformas recentes, proximidade a comércios, transporte público, etc."
                  rows={5}
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

              {/* ✅ UPLOAD DE FOTOS */}
              <div className="sm:col-span-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Fotos do imóvel *
                </h3>
                
                <div
                  className={`border-2 border-dashed ${
                    errors.imagens ? "border-red-500" : "border-gray-300"
                  } rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 transition-colors`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <PhotoIcon className="h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-xl font-medium text-gray-700 mb-2">Adicione as fotos do seu imóvel</h4>
                  <p className="text-gray-500 mb-4">Arraste e solte as fotos aqui ou clique para selecionar</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#8B6F48] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#7a5f3a] transition-colors"
                  >
                    Escolher fotos
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  {errors.imagens && (
                    <p className="text-red-500 text-sm mt-3">
                      Por favor, adicione pelo menos uma foto do imóvel
                    </p>
                  )}
                </div>

                {/* ✅ PREVIEW DAS IMAGENS */}
                {imagensTemporarias.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-4">
                      Fotos selecionadas ({imagensTemporarias.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {imagensTemporarias.map((imagem, index) => (
                        <div
                          key={imagem.id}
                          className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
                        >
                          <Image
                            src={imagem.previewUrl}
                            alt={`Foto ${index + 1} do imóvel`}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={() => removerImagem(imagem.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remover foto ${index + 1}`}
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ BOTÃO DE ENVIO */}
              <div className="sm:col-span-3 pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#8B6F48] to-[#7a5f3a] text-white py-4 rounded-xl font-semibold text-lg hover:from-[#7a5f3a] hover:to-[#6b5230] transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  🏠 Cadastrar meu imóvel gratuitamente
                </button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Ao cadastrar, você autoriza nossa equipe a entrar em contato para agendar uma <strong>avaliação gratuita</strong>.
                </p>
              </div>
            </form>
          </section>
        )}

        {formState === "loading" && (
          <div className="flex flex-col items-center justify-center py-16" aria-live="polite">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8B6F48] mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Processando seu cadastro...</h2>
            <p className="text-gray-600">Enviando informações e fotos do seu imóvel</p>
          </div>
        )}

        {formState === "success" && (
          <div className="text-center py-16" aria-live="polite">
            <div className="bg-green-50 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-700 mb-4">
                Imóvel cadastrado com sucesso!
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                Recebemos todas as informações e fotos do seu imóvel.
              </p>
              <p className="text-gray-600">
                Nossa equipe especializada entrará em contato em até <strong>24 horas</strong> para agendar 
                uma avaliação gratuita e iniciar o processo de comercialização.
              </p>
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO INFORMATIVA ADICIONAL */}
        <section className="mt-20 border-t pt-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Como funciona nosso processo
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                Processo de Venda
              </h3>
              <p className="text-gray-600 mb-4">
                Nossa metodologia comprovada inclui análise de mercado, definição de preço estratégico,
                marketing multicanal e negociação especializada. Cuidamos de toda a documentação
                e acompanhamos o processo até a escritura.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Avaliação gratuita por corretor CRECI
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Fotografia profissional e tour virtual
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Anúncios em mais de 20 portais imobiliários
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Marketing nas redes sociais
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Acompanhamento jurídico completo
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                Processo de Locação
              </h3>
              <p className="text-gray-600 mb-4">
                Especializados em locação residencial e comercial, oferecemos análise criteriosa de inquilinos,
                contratos seguros e gestão completa da locação. Garantimos tranquilidade total para
                proprietários e segurança jurídica.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Análise criteriosa de inquilinos
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Contratos com garantias adequadas
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Gestão de pagamentos e vistorias
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Suporte jurídico especializado
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Relatórios mensais para proprietários
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}
