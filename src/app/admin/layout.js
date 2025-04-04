"use client";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";

// Carregar a fonte Inter no lado do cliente para evitar problemas de hidratação
const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Marcar componente como montado para evitar problemas de hidratação
    setMounted(true);

    // Verificar autenticação armazenada no sessionStorage
    const authStatus = sessionStorage.getItem("admin_authenticated");
    setIsLoggedIn(authStatus === "true");
  }, []);

  // Não renderizar nada durante SSR para componentes que dependem de estado do cliente
  if (!mounted) {
    return null;
  }

  // Se for a página de login, não aplica este layout (usa o layout específico de login)
  if (pathname === "/admin/login") {
    return children;
  }

  // Redirecionar para login se não estiver autenticado e não estiver na página de login
  if (!isLoggedIn && pathname !== "/admin/login") {
    // Usando client-side redirect aqui, já que estamos em um componente cliente
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
      return null;
    }
  }

  return (
    <div className={`min-h-screen bg-gray-100 text-xs ${inter.className}`}>
      {/* Sidebar para navegação */}
      {isLoggedIn && <Sidebar />}

      {/* Conteúdo principal */}
      <div
        className={`min-h-screen ${isLoggedIn ? "ml-64" : ""
          } transition-all duration-300 ease-in-out`}
      >
        {isLoggedIn && (
          <header className="bg-black text-white shadow-md">
            <div className="ml-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <h1>Bem vindo, Eduardo.</h1>
              <button
                onClick={() => {
                  sessionStorage.removeItem("admin_authenticated");
                  window.location.href = "/admin/login";
                }}
                className="p-4 bg-[#8B6F48] text-white rounded-md hover:[#8B6F48]/80 transition-colors"
              >
                Sair
              </button>
            </div>
          </header>
        )}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
