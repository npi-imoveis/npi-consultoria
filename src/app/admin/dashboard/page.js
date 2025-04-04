"use client";

import { useEffect } from "react";
import AuthCheck from "../components/auth-check";
import Card from "../components/card";
export default function AdminDashboard() {
  return (
    <AuthCheck>
      <div className="">
        <h1 className="text-2xl font-bold mb-4">Painel Administrativo</h1>

        <span className="text-gray-700 mb-4">
          Bem-vindo ao painel administrativo da NPI Imóveis. Utilize o menu lateral para navegar
          entre as diferentes seções.
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card
            title="Imóveis"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Gerenciar"
            buttonHref="#"
          />
          <Card
            title="Condomínios"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Gerenciar"
            buttonHref="#"
          />
          <Card
            title="Automação"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Revisar"
            buttonHref="#"
          />
          <Card
            title="Automação"
            value="3.475"
            description="Suitable to grow steadily."
            buttonText="Revisar"
            buttonHref="#"
          />

        </div>

      </div>
    </AuthCheck>
  );
}
