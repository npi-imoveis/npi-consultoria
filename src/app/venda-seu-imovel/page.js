"use client";

import React, { useState } from "react";
import { HeaderPage } from "../components/ui/header-page";

export default function ImovelForm() {
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
  });

  // Função para formatar número de telefone
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
    };

    setErrors(novosErros);
    return !Object.values(novosErros).some((erro) => erro);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (validarFormulario()) {
      setFormState("loading");

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
          })
          .catch((error) => {
            console.error("Erro ao enviar mensagem:", error);
            setFormState("form");
            alert("Erro ao enviar mensagem. Por favor, tente novamente.");
          });
      });
    }
  };

  return (
    <section>
      <HeaderPage
        title="Aqui você pode cadastrar seu imóvel para venda ou locação"
        description="Aqui você pode cadastrar seu imóvel para venda ou locação."
        image="/assets/images/imoveis/02.jpg"
      />
      <div className="container mx-auto px-4 py-16">
        <p className="py-4">
          <strong>Dicas:</strong> Fotos na posição horizontal e luzes acesas de
          todos ambientes e do lazer, valorizam mais o anuncio do seu imóvel ;)
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
              {errors.nome && <p className="text-red-500 text-xs mt-1">Por favor, informe seu nome</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.email ? "border-red-500" : ""}`}
                placeholder="E-mail*"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">Por favor, informe um e-mail válido</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.telefone ? "border-red-500" : ""}`}
                placeholder="Telefone*"
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                required
              />
              {errors.telefone && <p className="text-red-500 text-xs mt-1">Por favor, informe um telefone válido com DDD</p>}
            </div>

            <div>
              <select
                className={`border rounded py-2 px-3 w-full bg-white ${errors.tipoImovel ? "border-red-500" : ""}`}
                name="tipoImovel"
                value={formData.tipoImovel}
                onChange={handleInputChange}
                required
              >
                <option value="">Tipo de Imóvel*</option>
                <option>Apartamento</option>
                <option>Casa</option>
              </select>
              {errors.tipoImovel && <p className="text-red-500 text-xs mt-1">Por favor, selecione o tipo de imóvel</p>}
            </div>

            <div>
              <select
                className={`border rounded py-2 px-3 w-full bg-white ${errors.acao ? "border-red-500" : ""}`}
                name="acao"
                value={formData.acao}
                onChange={handleInputChange}
                required
              >
                <option value="">O que deseja fazer?*</option>
                <option>Venda</option>
                <option>Locação</option>
              </select>
              {errors.acao && <p className="text-red-500 text-xs mt-1">Por favor, selecione a ação desejada</p>}
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
                className={`border rounded py-2 px-3 w-full ${errors.endereco ? "border-red-500" : ""}`}
                placeholder="Endereço*"
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                required
              />
              {errors.endereco && <p className="text-red-500 text-xs mt-1">Por favor, informe o endereço</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.numero ? "border-red-500" : ""}`}
                placeholder="Número*"
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                required
              />
              {errors.numero && <p className="text-red-500 text-xs mt-1">Por favor, informe o número</p>}
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
                className={`border rounded py-2 px-3 w-full ${errors.bairro ? "border-red-500" : ""}`}
                placeholder="Bairro*"
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleInputChange}
                required
              />
              {errors.bairro && <p className="text-red-500 text-xs mt-1">Por favor, informe o bairro</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.cidade ? "border-red-500" : ""}`}
                placeholder="Cidade*"
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                required
              />
              {errors.cidade && <p className="text-red-500 text-xs mt-1">Por favor, informe a cidade</p>}
            </div>

            <div>
              <select
                className={`border rounded py-2 px-3 w-full bg-white ${errors.estado ? "border-red-500" : ""}`}
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="">Estado*</option>
                <option>São Paulo</option>
                <option>Outro Estado</option>
              </select>
              {errors.estado && <p className="text-red-500 text-xs mt-1">Por favor, selecione o estado</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.valorImovel ? "border-red-500" : ""}`}
                placeholder="Valor do Imóvel (R$)*"
                type="number"
                name="valorImovel"
                value={formData.valorImovel}
                onChange={handleInputChange}
                required
              />
              {errors.valorImovel && <p className="text-red-500 text-xs mt-1">Por favor, informe o valor do imóvel</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.valorCondominio ? "border-red-500" : ""}`}
                placeholder="Valor do Condomínio (R$)*"
                type="number"
                name="valorCondominio"
                value={formData.valorCondominio}
                onChange={handleInputChange}
                required
              />
              {errors.valorCondominio && <p className="text-red-500 text-xs mt-1">Por favor, informe o valor do condomínio</p>}
            </div>

            <div>
              <input
                className={`border rounded py-2 px-3 w-full ${errors.valorIptu ? "border-red-500" : ""}`}
                placeholder="Valor do IPTU (R$)*"
                type="number"
                name="valorIptu"
                value={formData.valorIptu}
                onChange={handleInputChange}
                required
              />
              {errors.valorIptu && <p className="text-red-500 text-xs mt-1">Por favor, informe o valor do IPTU</p>}
            </div>

            <div className="sm:col-span-3">
              <textarea
                className={`border rounded py-2 px-3 w-full ${errors.descricao ? "border-red-500" : ""}`}
                placeholder="Faça uma descrição rica em detalhes do seu imóvel*"
                rows={4}
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                required
              />
              {errors.descricao && <p className="text-red-500 text-xs mt-1">Por favor, informe a descrição do imóvel</p>}
            </div>

            <div className="sm:col-span-3">
              <UploadArea />
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
          <div className="flex items-center justify-center mt-8 h-40" aria-live="polite" aria-busy="true">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B6F48]" role="status">
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
    </section>
  );
}

function UploadArea() {
  return (
    <div className="w-full mx-auto py-4">
      <div className="mb-4">
        <p>
          Dicas: Fotos na posição horizontal, com todas as luzes acesas, fotos
          do lazer e da fachada, valorizam e chamam mais atenção para o anúncio
          do seu imóvel ;)
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center">
        <p className="text-gray-600 font-medium">
          Copie &amp; Cole as fotos aqui
        </p>
        <p className="text-gray-500 my-2">ou</p>
        <button
          type="button"
          className="text-[#7a5f3a] hover:underline font-semibold"
        >
          Escolher arquivos
        </button>
      </div>
    </div>
  );
}
