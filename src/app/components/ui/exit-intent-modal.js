"use client";

import { useState, useEffect } from "react";

const EXIT_INTENT_MODAL_KEY = "exitIntentModalLastShown";
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export default function ExitIntentModal({ condominio, link }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState("form"); // "form", "loading", "success"
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    tipo_imovel: "",
    finalidade: "",
    faixa_valor: "",
    urgencia: "",
    bairro: "",
    dormitorios: "",
    vagas: "",
    outras_caracteristicas: "",
  });
  const [errors, setErrors] = useState({
    nome: false,
    telefone: false,
    email: false,
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
      return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 7)}-${numeroLimitado.slice(
        7
      )}`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefone") {
      setFormData((prev) => ({ ...prev, [name]: formatarTelefone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
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
            "template_tdiet3w",
            {
              name: formData.nome,
              email: formData.email,
              phone: formData.telefone,
              title: `Lead de saída - Interesse no condomínio ${condominio}`,
              message: `Lead de saída do site.\n\nCondomínio: ${condominio}\nLink: ${link}\n\nNome: ${formData.nome}\nTelefone: ${formData.telefone}\nEmail: ${formData.email}\nTipo de imóvel: ${formData.tipo_imovel}\nFinalidade: ${formData.finalidade}\nFaixa de valor: ${formData.faixa_valor}\nUrgência: ${formData.urgencia}\nBairro: ${formData.bairro}\nDormitórios: ${formData.dormitorios}\nVagas: ${formData.vagas}\nOutras características: ${formData.outras_caracteristicas}`,
            },
            "sraRHEjyadY96d2x1"
          )
          .then(() => {
            setFormState("success");
            // WhatsApp redirect
            const isMobile = () =>
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
              );
            const message = `Olá! Tenho interesse no condomínio ${condominio}.\n\nNome: ${formData.nome}\nTelefone: ${formData.telefone}\nEmail: ${formData.email}\nTipo de imóvel: ${formData.tipo_imovel}\nFinalidade: ${formData.finalidade}\nFaixa de valor: ${formData.faixa_valor}\nUrgência: ${formData.urgencia}\nBairro: ${formData.bairro}\nDormitórios: ${formData.dormitorios}\nVagas: ${formData.vagas}\nOutras características: ${formData.outras_caracteristicas}\nLink: ${link}`;
            const baseUrl = isMobile() ? "whatsapp://send" : "https://web.whatsapp.com/send";
            const whatsappUrl = `${baseUrl}?phone=5511969152222&text=${encodeURIComponent(
              message
            )}`;
            setTimeout(() => {
              if (isMobile()) {
                window.location.href = whatsappUrl;
              } else {
                window.open(whatsappUrl, "_blank");
              }
              setIsOpen(false);
            }, 1200);
          })
          .catch((error) => {
            console.error("Erro ao enviar mensagem:", error);
            setFormState("form");
            alert("Erro ao enviar mensagem. Por favor, tente novamente.");
          });
      });
    }
  };

  useEffect(() => {
    const handleMouseOut = (e) => {
      // Se o ponteiro sai do viewport pelo topo (y <= 0)
      if (e.clientY <= 0) {
        // Verifica se já se passaram 12 horas desde a última exibição
        const lastShown = localStorage.getItem(EXIT_INTENT_MODAL_KEY);
        const now = Date.now();
        if (!lastShown || now - Number(lastShown) > TWELVE_HOURS_MS) {
          setIsOpen(true);
          localStorage.setItem(EXIT_INTENT_MODAL_KEY, now.toString());
        }
        window.removeEventListener("mouseout", handleMouseOut);
      }
    };

    window.addEventListener("mouseout", handleMouseOut);
    return () => window.removeEventListener("mouseout", handleMouseOut);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]">
      <div className="bg-white rounded-lg p-4 w-[800px] mx-4">
        <div className="w-full flex justify-end">
          <button onClick={() => setIsOpen(false)}>X</button>
        </div>
        <h2 className="text-2xl font-bold text-center">Espere, não vá embora ainda</h2>
        <p className="mt-2 text-center">
          Notamos seu interesse no <strong>{condominio}</strong>. <br />
          Preencha o formuário abaixo para receber uma seleção personalizada.
        </p>
        {formState === "form" && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-2 mt-4 border p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Nome</label>
                <input
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`border text-xs rounded-md p-2 ${errors.nome ? "border-red-500" : ""}`}
                  placeholder="Digite seu nome"
                />
                {errors.nome && <span className="text-red-500 text-xs">Informe seu nome</span>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">E-mail</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`border text-xs rounded-md p-2 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Digite seu e-mail"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">Informe um e-mail válido</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Telefone</label>
                <input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className={`border text-xs rounded-md p-2 ${
                    errors.telefone ? "border-red-500" : ""
                  }`}
                  placeholder="Digite seu telefone"
                />
                {errors.telefone && (
                  <span className="text-red-500 text-xs">Informe um telefone válido</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 border p-4 rounded-lg">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Tipo de imóvel</label>
                <select
                  name="tipo_imovel"
                  value={formData.tipo_imovel}
                  onChange={handleInputChange}
                  className="border text-xs rounded-md p-2"
                >
                  <option value="">Selecione</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="casa">Casa</option>
                  <option value="sala comercial">Sala Comercial</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Finalidade</label>
                <select
                  name="finalidade"
                  value={formData.finalidade}
                  onChange={handleInputChange}
                  className="border text-xs rounded-md p-2"
                >
                  <option value="">Selecione</option>
                  <option value="comprar">Comprar</option>
                  <option value="alugar">Alugar</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Faixa de valor</label>
                <select
                  name="faixa_valor"
                  value={formData.faixa_valor}
                  onChange={handleInputChange}
                  className="border text-xs rounded-md p-2"
                >
                  <option value="">Selecione</option>
                  <option value="até 2 milhões">Até 2 milhões</option>
                  <option value="2 a 4 milhões">De 2 à 4 milhões</option>
                  <option value="4 a 10 milhões">De 4 à 10 milhões</option>
                  <option value=">10 milhões">Acima de 10 milhões</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Urgência</label>
                <select
                  name="urgencia"
                  value={formData.urgencia}
                  onChange={handleInputChange}
                  className="border text-xs rounded-md p-2"
                >
                  <option value="">Selecione</option>
                  <option value="até 30 dias">Até 30 dias</option>
                  <option value="até 90 dias">Até 90 dias</option>
                  <option value=">90 dias">Mais de 90 dias</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold">Bairro</label>
                <input
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className="border text-xs rounded-md p-2"
                  placeholder="Digite o bairro"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold">Dormitórios</label>
                  <select
                    name="dormitorios"
                    value={formData.dormitorios}
                    onChange={handleInputChange}
                    className="border text-xs rounded-md p-2"
                  >
                    <option value="">Selecione</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>

                    <option value="4 ou mais">4 ou mais</option>
                  </select>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <label className="text-[10px] font-bold">Vagas</label>
                  <select
                    name="vagas"
                    value={formData.vagas}
                    onChange={handleInputChange}
                    className="border text-xs rounded-md p-2"
                  >
                    <option value="">Selecione</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4 ou mais">4 ou mais</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 mt-2">
              <label className="text-[10px] font-bold">Outras características</label>
              <textarea
                name="outras_caracteristicas"
                value={formData.outras_caracteristicas}
                onChange={handleInputChange}
                className="border text-xs rounded-md p-2"
              />
            </div>
            <div className="flex gap-4 justify-end items-center">
              <button className="mt-4 text-sm font-bold px-6 py-2 border text-black rounded-full">
                Fechar
              </button>
              <button
                type="submit"
                className="mt-4 text-sm font-bold px-6 py-2 bg-black text-white rounded-full"
              >
                Enviar
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
