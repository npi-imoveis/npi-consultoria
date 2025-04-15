"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAuthenticating) return; // Previne múltiplos submits

    setIsAuthenticating(true);
    setError("");
    setSuccess("");

    console.log("Login: Attempting to sign in...");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        console.log("Login: Sign in successful.");
        setSuccess("Login realizado com sucesso!");
        setEmail("");
        setPassword("");
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      setError(
        err.code === 'auth/invalid-credential'
          ? "E-mail ou senha incorretos"
          : "Ocorreu um erro ao tentar fazer login"
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Não mostrar a página de login se estiver carregando
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

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

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isAuthenticating}
                  className="text-sm py-3 px-4 text-gray-500 w-full rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  disabled={isAuthenticating}
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
                  disabled={isAuthenticating}
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
                disabled={isAuthenticating}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isAuthenticating ? "bg-gray-400" : "bg-black hover:bg-black/80"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-colors`}
              >
                {isAuthenticating ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              É uma imobiliária?{" "}
              <a href="#" className="text-[#8B6F48] hover:text-[#8B6F48]/80">
                Cadastrar
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}