"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setIsLoading(true);

    emailjs
      .send(
        "service_az9rp6u",
        "template_tdiet3w",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          title: formData.title,
          message: `${formData.message}\n\nTelefone para contato: ${formData.phone}`,
        },
        "sraRHEjyadY96d2x1"
      )
      .then(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setFormData({
          name: "",
          phone: "",
          email: "",
          title: "",
          message: "",
        });

        // Redirecionamento para WhatsApp após 3 segundos
        setTimeout(() => {
          window.open(
            "https://web.whatsapp.com/send?phone=5511969152222&text=NPi%20Consultoria%20-%20Im%C3%B3veis%20de%20Alto%20Padr%C3%A3o.%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o(a)%20Apartamento%20no%20bairro%20Ibirapuera%20que%20vi%20no%20site%20de%20voc%C3%AAs:%20https://www.npiconsultoria.com.br/imovel-105627/horiz-ibirapuera%20-%20H%C3%B3riz%20Ibirapuera.%20Pode%20me%20ajudar?",
            "_blank"
          );
        }, 2000);
      })
      .catch((error) => {
        console.error("Erro ao enviar mensagem:", error);
        setIsLoading(false);
        alert("Erro ao enviar mensagem. Por favor, tente novamente.");
      });
  };

  return (
    <section className="flex justify-center items-center bg-black text-white py-16 px-6">
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 max-w-6xl">
        {/* Texto à esquerda */}
        <div className="lg:w-1/2">
          <h2 className="text-3xl font-bold mb-4">Fale conosco</h2>
          <p className="mb-4">
            Caso tenha interesse em fazer parte do HUB, entre em contato para verificarmos se sua
            área de atuação ainda está disponível.
          </p>
          <p>Fale conosco pelo WhatsApp, ou preencha o formulário de contato.</p>
        </div>

        {/* Formulário à direita */}
        <div className="lg:w-1/2">
          {isSuccess ? (
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <p className="text-center">
                  Mensagem enviada com sucesso. Você será direcionado a nossa equipe de atendimento.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={sendEmail} className="p-6 rounded-lg">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8B6F48] mb-4"></div>
                  <p className="text-center">Enviando mensagem...</p>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome"
                    className="w-full p-3 bg-zinc-950 mb-4 border-2 border-zinc-800 rounded-md text-xs"
                    required
                  />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Telefone (DDD + Número)"
                    className="w-full p-3 bg-zinc-950 mb-4 border-2 border-zinc-800 rounded-md text-xs"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-mail"
                    className="w-full p-3 bg-zinc-950 mb-4 border-2 border-zinc-800 rounded-md text-xs"
                    required
                  />
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Assunto"
                    className="w-full p-3 bg-zinc-950 mb-4 border-2 border-zinc-800 rounded-md text-xs"
                    required
                  />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mensagem"
                    rows="4"
                    className="w-full p-3 bg-zinc-950 mb-4 border-2 border-zinc-800 rounded-md text-xs"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="w-full bg-[#8B6F48] text-white hover:bg-opacity-90 rounded px-4 py-2 "
                  >
                    <span className="flex items-center gap-2">
                      Enviar
                      <svg
                        className="size-5 rtl:rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
