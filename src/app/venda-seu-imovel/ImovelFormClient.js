"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { getImageUploadMetadata, uploadToS3 } from "../utils/s3-upload";
import { PhotoIcon, XCircleIcon } from "@heroicons/react/24/outline";
import emailjs from '@emailjs/browser'; // ✅ Import estático ao invés de dinâmico

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

  // ✅ Inicialização do EmailJS
  React.useEffect(() => {
    emailjs.init("sraRHEjyadY96d2x1");
  }, []);

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
    const novasImagens = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      isUploading: false,
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

  // ✅ Função melhorada para fazer upload das imagens para o S3
  const uploadImages = async () => {
    try {
      console.log("Iniciando upload das imagens...", imagensTemporarias.length);
      
      const uploadPromises = imagensTemporarias.map(async (imagem, index) => {
        try {
          console.log(`Uploading imagem ${index + 1}/${imagensTemporarias.length}`);
          const metadata = await getImageUploadMetadata(imagem.file);
          await uploadToS3(metadata);
          console.log(`Imagem ${index + 1} enviada com sucesso:`, metadata.fileUrl);
          return metadata.fileUrl;
        } catch (error) {
          console.error(`Erro ao fazer upload da imagem ${imagem.id}:`, error);
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);
      console.log("Todas as imagens foram enviadas:", urls);
      return urls;
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
      throw new Error("Falha ao enviar uma ou mais imagens");
    }
  };

  // ✅ Função de envio corrigida
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    console.log("Iniciando envio do formulário...");

    if (!validarFormulario()) {
      console.log("Formulário inválido, parando envio");
      return;
    }

    setFormState("loading");

    try {
      // ✅ Primeiro, fazer upload das imagens
      let imageUrls = [];
      
      if (imagensTemporarias.length > 0) {
        console.log("Fazendo upload das imagens...");
        imageUrls = await uploadImages();
      } else {
        console.log("Nenhuma imagem para fazer upload");
      }

      // ✅ Preparar dados para o email
      const emailData = {
        to_name: "NPI Consultoria", // ✅ Adicionado
        from_name: formData.nome,
        from_email: formData.email,
        telefone: formData.telefone,
        tipo_imovel: formData.tipoImovel,
        acao: formData.acao,
        cep: formData.cep,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento || "Não informado",
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        valor_imovel: formData.valorImovel,
        valor_condominio: formData.valorCondominio,
        valor_iptu: formData.valorIptu,
        descricao: formData.descricao,
        imagens_urls: imageUrls.length > 0 ? imageUrls.join("\n") : "Nenhuma imagem enviada",
        message: `
🏠 NOVO CADASTRO DE IMÓVEL

👤 DADOS PESSOAIS:
Nome: ${formData.nome}
E-mail: ${formData.email}
Telefone: ${formData.telefone}

🏘️ DADOS DO IMÓVEL:
Tipo: ${formData.tipoImovel}
Ação: ${formData.acao}
CEP: ${formData.cep}
Endereço: ${formData.endereco}, ${formData.numero}
Complemento: ${formData.complemento || "Não informado"}
Bairro: ${formData.bairro}
Cidade: ${formData.cidade}
Estado: ${formData.estado}

💰 VALORES:
Valor do Imóvel: R$ ${formData.valorImovel}
Condomínio: R$ ${formData.valorCondominio}
IPTU: R$ ${formData.valorIptu}

📝 DESCRIÇÃO:
${formData.descricao}

📸 IMAGENS:
${imageUrls.length > 0 ? imageUrls.join("\n") : "Nenhuma imagem enviada"}
        `
      };

      console.log("Enviando email com os dados:", emailData);

      // ✅ Enviar email com await
      const result = await emailjs.send(
        "service_az9rp6u",
        "template_p8hi73i",
        emailData,
        "sraRHEjyadY96d2x1"
      );

      console.log("Email enviado com sucesso:", result);
      
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

    } catch (error) {
      console.error("Erro no processo de envio:", error);
      setFormState("form");
      
      // ✅ Mensagem de erro mais específica
      let errorMessage = "Erro ao enviar formulário. ";
      
      if (error.message && error.message.includes("imagens")) {
        errorMessage += "Problema no upload das imagens. ";
      } else if (error.text) {
        errorMessage += `Erro do EmailJS: ${error.text}`;
      } else {
        errorMessage += "Por favor, tente novamente.";
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* ✅ ÚNICO H1 + CONTEÚDO SEO */}
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Cadastre seu Imóvel Gratuitamente no HUB da NPi
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          <strong>Cadastre gratuitamente</strong> seu apartamento de alto padrão, casa em condomínio, casa, ou laje comercial para venda ou locação. 
          Seu imóvel será divulgado para todos as empresas do HUB e posicionado na maior vitrine do mundo, o GOOGLE.
        </p>
      </div>

      {/* ✅ BENEFÍCIOS */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          Por que escolher a NPI Consultoria?
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-blue-700">
          <div>
            <h3 className="font-semibold mb-1">Exposição estratégica do seu imóvel</h3>
            <p className="text-sm">Somos especializados em posicionamento no Google, acelerando a comercialização do seu imóvel</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Marketing Completo</h3>
            <p className="text-sm">Divulgamos seu imóvel em todo nosso ecossistema de imobiliárias Boutique de Alto Padrão</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Suporte Total</h3>
            <p className="text-sm">Acompanhamento jurídico e negociação especializada de nossos profissionais</p>
          </div>
        </div>
      </div>

      <p className="py-4 bg-yellow-50 px-4 rounded-lg mb-6">
        <strong>Dicas:</strong> Fotos na posição horizontal e luzes acesas de todos ambientes e do
        lazer, valorizam mais o anuncio do seu imóvel ;)
      </p>

      {formState === "form" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <input
              className={`border rounded py-2 px-3 w-full ${errors.nome ? "border-red-500" : ""}`}
              placeholder="Nome*"
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
            {errors.nome && (
              <p className="text-red-500 text-xs mt-1">Por favor, informe seu nome</p>
            )}
          </div>

          <div>
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="E-mail*"
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
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.telefone ? "border-red-500" : ""
              }`}
              placeholder="Telefone*"
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
            <select
              className={`border rounded py-2 px-3 w-full bg-white ${
                errors.tipoImovel ? "border-red-500" : ""
              }`}
              name="tipoImovel"
              value={formData.tipoImovel}
              onChange={handleInputChange}
              required
            >
              <option value="">Tipo de Imóvel*</option>
              <option>Apartamento</option>
              <option>Casa</option>
            </select>
            {errors.tipoImovel && (
              <p className="text-red-500 text-xs mt-1">Por favor, selecione o tipo de imóvel</p>
            )}
          </div>

          <div>
            <select
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
            </select>
            {errors.acao && (
              <p className="text-red-500 text-xs mt-1">Por favor, selecione a ação desejada</p>
            )}
          </div>

          <div>
            <input
              className={`border rounded py-2 px-3 w-full ${errors.cep ? "border-red-500" : ""}`}
              placeholder="CEP*"
              type="text"
              name="cep"
              value={formData.cep}
              onChange={handleInputChange}
              required
            />
            {errors.cep && <p className="text-red-500 text-xs mt-1">Por favor, informe o CEP</p>}
          </div>

          <div>
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.endereco ? "border-red-500" : ""
              }`}
              placeholder="Endereço*"
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
            <input
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
            <input
              className="border rounded py-2 px-3 w-full"
              placeholder="Complemento"
              type="text"
              name="complemento"
              value={formData.complemento}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.bairro ? "border-red-500" : ""
              }`}
              placeholder="Bairro*"
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
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.cidade ? "border-red-500" : ""
              }`}
              placeholder="Cidade*"
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
            <select
              className={`border rounded py-2 px-3 w-full bg-white ${
                errors.estado ? "border-red-500" : ""
              }`}
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              required
            >
              <option value="">Estado*</option>
              <option>São Paulo</option>
              <option>Outro Estado</option>
            </select>
            {errors.estado && (
              <p className="text-red-500 text-xs mt-1">Por favor, selecione o estado</p>
            )}
          </div>

          <div>
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.valorImovel ? "border-red-500" : ""
              }`}
              placeholder="Valor do Imóvel (R$)*"
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
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.valorCondominio ? "border-red-500" : ""
              }`}
              placeholder="Valor do Condomínio (R$)*"
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
            <input
              className={`border rounded py-2 px-3 w-full ${
                errors.valorIptu ? "border-red-500" : ""
              }`}
              placeholder="Valor do IPTU (R$)*"
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
            <textarea
              className={`border rounded py-2 px-3 w-full ${
                errors.descricao ? "border-red-500" : ""
              }`}
              placeholder="Faça uma descrição rica em detalhes do seu imóvel*"
              rows={4}
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              required
            />
            {errors.descricao && (
              <p className="text-red-500 text-xs mt-1">
                Por favor, informe a descrição do imóvel
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <div className="w-full mx-auto py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Dicas: Fotos na posição horizontal, com todas as luzes acesas, fotos do lazer e
                  da fachada, valorizam e chamam mais atenção para o anúncio do seu imóvel ;)
                </p>
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
                    Por favor, adicione pelo menos uma imagem
                  </p>
                )}
              </div>

              {/* Visualização das imagens selecionadas */}
              {imagensTemporarias.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-700 mb-4">
                    Imagens selecionadas ({imagensTemporarias.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagensTemporarias.map((imagem, index) => (
                      <div
                        key={imagem.id}
                        className="relative group bg-gray-100 rounded-md overflow-hidden"
                      >
                        <div className="relative h-40 w-full">
                          <Image
                            src={imagem.previewUrl}
                            alt={`Preview da imagem ${index + 1}`}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removerImagem(imagem.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
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
              className="w-full bg-[#8B6F48] text-white py-3 rounded font-semibold hover:bg-[#7a5f3a] transition-colors"
            >
              Anunciar meu imóvel
            </button>
          </div>
        </form>
      )}

      {formState === "loading" && (
        <div
          className="flex items-center justify-center mt-8 h-40"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B6F48]"
            role="status"
          >
            <span className="sr-only">Carregando...</span>
          </div>
        </div>
      )}

      {formState === "success" && (
        <div className="flex flex-col items-center justify-center mt-8 h-40" aria-live="polite">
          <p className="text-lg font-bold text-center text-[#8B6F48]">
            Seu imóvel foi cadastrado com sucesso!
          </p>
          <p className="text-sm text-center text-gray-600 mt-2">
            Em breve um consultor entrará em contato para mais informações.
          </p>
        </div>
      )}
    </div>
  );
}
