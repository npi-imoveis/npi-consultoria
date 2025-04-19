"use client";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

// Carregar a fonte Inter no lado do cliente para evitar problemas de hidratação
const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Marcar componente como montado para evitar problemas de hidratação
    setMounted(true);

    // Verificar autenticação com Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Controle de expiração de sessão (1 hora)
        const loginTime = localStorage.getItem("admin_login_time");
        if (loginTime && Date.now() - Number(loginTime) > 60 * 60 * 1000) {
          auth.signOut();
          localStorage.removeItem("admin_login_time");
          window.location.href = "/admin/login";
          setIsLoggedIn(false);
          setIsAuthLoading(false);
          return;
        }
        setIsLoggedIn(true);
        setUserName(user.displayName || "Usuário");
        setUserEmail(user.email || "email@example.com");
        setIsAuthLoading(false);
      } else {
        setIsLoggedIn(false);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Não renderizar nada durante SSR para componentes que dependem de estado do cliente
  if (!mounted) {
    return null;
  }

  // Enquanto está carregando autenticação, mostra um loading
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Se for a página de login, não aplica este layout (usa o layout específico de login)
  if (pathname === "/admin/login") {
    return children;
  }

  // Redirecionar para login se não estiver autenticado e não estiver na página de login
  if (!isAuthLoading && !isLoggedIn && pathname !== "/admin/login") {
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
              <h1>Bem vindo {userEmail}.</h1>
              <button
                onClick={() => {
                  auth.signOut();
                  localStorage.removeItem("admin_login_time");
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
