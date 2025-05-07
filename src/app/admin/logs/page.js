"use client";

import { useEffect, useState } from "react";
import AuthCheck from "../components/auth-check";
import { buscarLogs } from "../services/log-service";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "lucide-react";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    buscarLogs().then((data) => {
      setLogs(data.data);
    });
  }, []);

  return (
    <AuthCheck>
      <div className="relative overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-bold tracking-wider capitalize"
              >
                Usuário
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-bold tracking-wider capitalize"
              >
                E-mail
              </th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold tracking-wider">
                Data
              </th>
              <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold tracking-wider">
                Ação
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-[10px] font-bold  tracking-wider sticky right-0 bg-gray-50"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-6 bg-gray-50 py-4 whitespace-nowrap text-[10px] text-gray-900 font-bold capitalize">
                  {log.user || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 font-bold capitalize">
                  {log.email.toLowerCase() || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700">
                  {log.data || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-700">
                  {log.action || "-"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white">
                  <div className="flex items-center space-x-3">
                    <button
                      className="text-black font-bold hover:text-gray-700 bg-gray-100 p-2 rounded-md"
                      title="Editar"
                      onClick={() => handleEdit(corretor.codigoD)}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="text-red-500 font-bold hover:text-red-400 bg-gray-100 p-2 rounded-md"
                      title="Deletar Imóvel"
                      onClick={() => handleDelete(corretor.codigoD)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthCheck>
  );
}
