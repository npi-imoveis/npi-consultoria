"use client";

import { useState } from "react";
// Remove direct import as we'll use dynamic import
// import emailjs from "@emailjs/browser";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    message: "",
  });
  const [formState, setFormState] = useState("form"); // Use formState instead of separate states

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setFormState("loading");

    // Dynamic import of emailjs
    import("@emailjs/browser").then((emailjs) => {
      emailjs.default
        .send(
          "service_az9rp6u",
          "template_tdiet3w",
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            title: formData.title,
            message: formData.message,
          },
          "sraRHEjyadY96d2x1"
        )
        .then(() => {
          setFormState("success");

          // Função para detectar dispositivo móvel
          const isMobile = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          };

          // Construir a mensagem
          const message = `NPi Consultoria - Imóveis de Alto Padrão. Olá, estou no site de vocês e gostaria de falar com algum consultor. Pode me ajudar?`;

          // Escolher a URL base apropriada
          const baseUrl = isMobile()
            ? 'whatsapp://send'
            : 'https://web.whatsapp.com/send';

          // Construir a URL completa
          const whatsappUrl = `${baseUrl}?phone=5511969152222&text=${encodeURIComponent(message)}`;

          // Redirecionar para o WhatsApp
          if (isMobile()) {
            window.location.href = whatsappUrl;
          } else {
            window.open(whatsappUrl, '_blank');
          }
        })
        .catch((error) => {
          console.error("Erro ao enviar mensagem:", error);
          setFormState("form");
          alert("Erro ao enviar mensagem. Por favor, tente novamente.");
        });
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
          {formState === "success" ? (
            <div className="p-6 flex flex-col items-center justify-center h-full">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <p className="text-center">
                  Mensagem enviada com sucesso. Você será direcionado a nossa equipe de atendimento.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={sendEmail} className="p-6 rounded-lg">
              {formState === "loading" ? (
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
