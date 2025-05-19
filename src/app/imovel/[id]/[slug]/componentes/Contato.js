"use client";

import { useState } from "react";
import ValoresUnidade from "./ValoresUnidade";

export default function Contato({ imovel, currentUrl }) {
  const [formState, setFormState] = useState("form"); // estados: "form", "loading", "success"
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    nome: false,
    telefone: false,
    email: false,
  });

  // Função para formatar número de telefone
  const formatarTelefone = (valor) => {
    // Remove todos os caracteres não numéricos
    const numerosApenas = valor.replace(/\D/g, "");

    // Limita a 11 dígitos (DDD + número)
    const numeroLimitado = numerosApenas.slice(0, 11);

    // Formata o número no padrão (XX) XXXXX-XXXX
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

    // Limpa o erro do campo quando o usuário começa a digitar
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
      telefone: !formData.telefone.trim() || formData.telefone.replace(/\D/g, "").length < 10,
      email: !formData.email.trim() || !validarEmail(formData.email),
    };

    setErrors(novosErros);

    // Retorna true se não houver erros
    return !Object.values(novosErros).some((erro) => erro);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (validarFormulario()) {
      setFormState("loading");

      // Usando emailjs para enviar o email
      import("@emailjs/browser").then((emailjs) => {
        emailjs.default
          .send(
            "service_az9rp6u",
            "template_tdiet3w",
            {
              name: formData.nome,
              email: formData.email,
              phone: formData.telefone,
              link: currentUrl,
              title: `Interesse no imóvel ${imovel.Empreendimento}`,
              message: `Interesse no imóvel ${imovel.Empreendimento}, código ${imovel.Codigo}.\n\nTelefone para contato: ${formData.telefone}`,
            },
            "sraRHEjyadY96d2x1"
          )
          .then(() => {
            setFormState("success");

            // Função para detectar dispositivo móvel
            const isMobile = () => {
              return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
              );
            };

            // Construir a mensagem
            const message = `Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponivel no link: ${currentUrl}`;

            // Escolher a URL base apropriada
            const baseUrl = isMobile() ? "whatsapp://send" : "https://web.whatsapp.com/send";

            // Construir a URL completa
            const whatsappUrl = `${baseUrl}?phone=5511969152222&text=${encodeURIComponent(
              message
            )}`;

            // Redirecionar para o WhatsApp
            if (isMobile()) {
              window.location.href = whatsappUrl;
            } else {
              window.open(whatsappUrl, "_blank");
            }
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
    <div className="rounded-lg min-w-[350px] w-full bg-white shadow-2xl p-4 mt-4 lg:mt-[-50px]">
      <ValoresUnidade imovel={imovel} currentUrl={currentUrl} />

      <div className="px-6 pb-10">
        <h3 className="text-base font-bold text-black" id="contato-form">
          Gostou deste imóvel?
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {imovel.ValorAntigo !== "0"
            ? "Fale conosco pelo WhatsApp ou preencha o formulário de contato."
            : "Não se preocupe, é possivel que outros imóveis estejam disponíveis no mesmo condomínio."}
        </p>

        {formState === "form" && (
          <form onSubmit={handleSubmit} aria-labelledby="contato-form">
            <div className="mt-8 space-y-3">
              <div>
                <label htmlFor="nome" className="sr-only">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  placeholder="Nome"
                  className={`w-full border ${
                    errors.nome ? "border-red-500" : "border-gray-300"
                  } rounded-lg py-2 px-3 text-zinc-700 text-xs font-semibold`}
                  aria-invalid={errors.nome}
                  aria-describedby={errors.nome ? "nome-error" : undefined}
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1" id="nome-error">
                    Por favor, informe seu nome
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="telefone" className="sr-only">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="Telefone (DDD + Número)"
                  className={`w-full border ${
                    errors.telefone ? "border-red-500" : "border-gray-300"
                  } rounded-lg py-2 px-3 text-zinc-700 text-xs font-semibold`}
                  aria-invalid={errors.telefone}
                  aria-describedby={errors.telefone ? "telefone-error" : undefined}
                />
                {errors.telefone && (
                  <p className="text-red-500 text-xs mt-1" id="telefone-error">
                    Por favor, informe um telefone válido com DDD
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="E-mail"
                  className={`w-full border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg py-2 px-3 text-zinc-700 text-xs font-semibold`}
                  aria-invalid={errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1" id="email-error">
                    Por favor, informe um e-mail válido
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-2 rounded-lg mt-8 hover:bg-zinc-800 transition-colors"
              aria-label="Agendar visita para conhecer o imóvel"
            >
              Agendar Visita
            </button>
          </form>
        )}

        {formState === "loading" && (
          <div
            className="flex items-center justify-center mt-8 h-40"
            aria-live="polite"
            aria-busy="true"
          >
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"
              role="status"
            >
              <span className="sr-only">Carregando...</span>
            </div>
          </div>
        )}

        {formState === "success" && (
          <div className="flex flex-col items-center justify-center mt-8 h-40" aria-live="polite">
            <p className="text-lg font-bold text-center text-[#8B6F48]">
              Em breve um consultor entrará em contato
            </p>
            <p className="text-sm text-center text-gray-600 mt-2">
              Você será redirecionado para o WhatsApp...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
