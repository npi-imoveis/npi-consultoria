import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function Contato({ condominio, currentUrl, bairro }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    emailjs
      .send(
        "service_az9rp6u",
        "template_tdiet3w",
        {
          title: formData.subject,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          link: currentUrl,
          message: `Interesse no condomínio ${condominio.Empreendimento}, no bairro ${condominio.BairroComercial}, disponivel no link: ${currentUrl}`,
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
          subject: "",
        });

        // Função para detectar dispositivo móvel
        const isMobile = () => {
          return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        };

        // Construir a mensagem
        const message = `Quero saber mais sobre o ${condominio.Empreendimento}, no bairro ${condominio.BairroComercial}, disponivel no link: ${currentUrl}`;

        // Escolher a URL base apropriada
        const baseUrl = isMobile() ? "whatsapp://send" : "https://web.whatsapp.com/send";

        // Construir a URL completa
        const whatsappUrl = `${baseUrl}?phone=5511969152222&text=${encodeURIComponent(message)}`;

        // Redirecionar para o WhatsApp
        if (isMobile()) {
          window.location.href = whatsappUrl;
        } else {
          window.open(whatsappUrl, "_blank");
        }
      })
      .catch((error) => {
        console.error("Erro ao enviar mensagem:", error);
        setIsLoading(false);
        alert("Erro ao enviar mensagem. Por favor, tente novamente.");
      });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-lg">
      {isSuccess ? (
        <div className="p-6 flex flex-col items-center justify-center h-full">
          <div className=" text-[#8B6F48] px-4 py-3 rounded relative mb-4">
            <p className="text-center">
              Mensagem enviada com sucesso. Você será direcionado a nossa equipe de atendimento.
            </p>
          </div>
        </div>
      ) : (
        <>
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
                className="w-full p-3 mb-4 rounded-md bg-zinc-100 text-xs"
                required
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telefone (DDD + Número)"
                className="w-full p-3 mb-4 rounded-md bg-zinc-100  text-xs"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail"
                className="w-full p-3 mb-4 rounded-md bg-zinc-100  text-xs"
                required
              />
              <textarea
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Assunto"
                rows="4"
                className="w-full p-3 mb-4 rounded-md bg-zinc-100  text-xs"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full  text-xs bg-[#8B6F48] text-white py-3 rounded font-semibold hover:bg-[#7a5f3a] transition-colors"
              >
                Enviar
              </button>
            </>
          )}
        </>
      )}
    </form>
  );
}
