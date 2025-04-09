"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Verificar se já está autenticado e marcar componente como montado
  useEffect(() => {
    setMounted(true);
    const isAuthenticated = sessionStorage.getItem("admin_authenticated") === "true";
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  // Não renderizar nada durante SSR para evitar problemas de hidratação
  if (!mounted) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Credenciais hardcoded - em produção, isso seria validado através de uma API segura
    if (username === "admin" && password === "admin") {
      // Armazenar estado de autenticação
      sessionStorage.setItem("admin_authenticated", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Usuário ou senha incorretos");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Lado esquerdo - Imagem */}
      <div className="hidden md:block w-1/2 bg-black h-full relative">
        <div className="flex items-center justify-center h-full">
          <Image
            src="/assets/images/bg-admin.jpg"
            alt="Background Administrativo"
            fill
            sizes="50vw"
            style={{ objectFit: "cover" }}
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8">LOGIN</h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block font-medium text-gray-700 mb-2">
                  Usuário
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="text-sm py-3 px-4 text-gray-500 w-full rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="exemplo@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="text-sm py-3 px-4 text-gray-500 w-full rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Manter Conectado
                </label>
              </div>
              <div>
                <a href="#" className="text-xs text-[#8B6F48] hover:text-[#8B6F48]/80">
                  Esqueceu a Senha?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-black/80"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-colors`}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              É uma imobiliária? <a href="#" className="text-[#8B6F48] hover:text-[#8B6F48]/80">Cadastrar</a>
            </span>
          </div>


        </div>
      </div>
    </div>
  );
}
