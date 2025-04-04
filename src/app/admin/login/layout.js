"use client";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLoginLayout({ children }) {
  return (
    <div
      className={`h-screen w-full overflow-hidden ${inter.className}`}
    >
      {/* Layout sem restrições para página de login */}
      {children}
    </div>
  );
}
