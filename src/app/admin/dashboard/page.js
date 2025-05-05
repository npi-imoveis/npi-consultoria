import Link from "next/link";
import AuthCheck from "../components/auth-check";
import Card from "../components/card";
import { getCorretores } from "../services";
import { getUsuarios } from "../services/usuarios";

import { getDashboard } from "../services/dashboard";
import { formatterNumber } from "@/app/utils/formatter-number";

export default async function AdminDashboard() {
  const { corretores } = await getCorretores({}, 1, 20);
  const { data: users } = await getUsuarios();

  const dashboard = await getDashboard();

  console.log("Corretores", corretores);

  // Sort corretores by the number of linked properties in descending order
  const sortedCorretores = [...corretores].sort(
    (a, b) => b.imoveis_vinculados.length - a.imoveis_vinculados.length
  );

  return (
    <AuthCheck>
      <div className="mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="Imóveis Cadastrados (BD)"
            value={formatterNumber(dashboard?.data?.imoveis)}
            link="/admin/imoveis"
          />
          <Card
            title="Imóveis Ativos"
            value={formatterNumber(dashboard?.data?.imoveisAtivos)}
            link="/admin/imoveis"
          />
          <Card
            title="Imóveis Inativos"
            value={formatterNumber(dashboard?.data?.imoveisInativos)}
            link="/admin/imoveis"
          />
          <Card
            title="Condomínios Cadastrados"
            value={formatterNumber(dashboard?.data?.condominios)}
            link="/admin/imoveis"
          />
          <Card
            title="Imóveis para Review"
            value={formatterNumber(dashboard?.data?.imoveisParaReview)}
            link="/admin/automacao"
          />
        </div>

        <div className="grid grid-cols-3 mt-4 gap-4">
          <div className="col-span-2 bg-white min-h-[200px] rounded-lg py-6 px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Parceiros (ranking) </h2>
              <span>Imóveis Vinculados</span>
            </div>

            <div className="mt-4">
              {sortedCorretores.map((parceiro) => (
                <Link
                  href={`/admin/corretores/editar/${parceiro.codigoD}`}
                  key={parceiro._id}
                  className="grid grid-cols-3 gap-2 border rounded-lg py-2 px-4 my-2"
                >
                  <div>
                    <h3 className="text-xs font-bold">{parceiro.nome}</h3>
                  </div>
                  <div>
                    <h3 className="text-xs text ">{parceiro.email}</h3>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-right">
                      {parceiro.imoveis_vinculados.length}
                    </h3>
                  </div>
                </Link>
              ))}
              <Link
                aria-describedby="tier-company"
                className="flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg nline-flex hover:bg-transparent hover:border-black hover:text-black focus:outline-none focus-visible:outline-black text-sm focus-visible:ring-black"
                href="#"
              >
                Ver todos
              </Link>
            </div>
          </div>
          <div className="bg-white min-h-[200px] rounded-lg py-6 px-4">
            <h2 className="text-lg font-bold">Usuários Ativos</h2>
            <div className="mt-4">
              {users?.users?.map((user) => (
                <div
                  key={user.uid}
                  className="grid grid-cols-3 gap-2 border rounded-lg py-2 px-4 my-2"
                >
                  {user.email}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
