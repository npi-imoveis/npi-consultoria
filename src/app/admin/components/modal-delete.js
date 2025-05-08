"use client";

import { useState } from "react";
import { deleteImovelAutomacao } from "../services/delete";
import { deleteCorretor } from "../services/corretor";
import { deleteImovel } from "../services/imovel";
import { getCurrentUserAndDate } from "@/app/utils/get-log";
import { salvarLog } from "../services/log-service";

export default function ModalDelete({ id, title, description, onClose, type }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      if (type === "automacao") {
        const response = await deleteImovelAutomacao(id);

        if (response.success) {
          handleClose();
          try {
            const { user, timestamp } = await getCurrentUserAndDate();
            await salvarLog({
              user: user.displayName ? user.displayName : "Não Identificado",
              email: user.email,
              data: timestamp.toISOString(),
              action: `Usuário ${user.email} deletou automação ${id}`,
            });
          } catch (error) {
            console.error("Erro ao deletar automação", error);
          }
        }
      }

      if (type === "corretor") {
        const response = await deleteCorretor(id);
        if (response.success) {
          handleClose();
          try {
            const { user, timestamp } = await getCurrentUserAndDate();
            await salvarLog({
              user: user.displayName ? user.displayName : "Não Identificado",
              email: user.email,
              data: timestamp.toISOString(),
              action: `Usuário ${user.email} deletou corretor ${id}`,
            });
          } catch (error) {
            console.error("Erro ao deletar corretor", error);
          }
        }
      }

      if (type === "imovel") {
        const response = await deleteImovel(id);
        if (response.success) {
          handleClose();
          try {
            const { user, timestamp } = await getCurrentUserAndDate();
            await salvarLog({
              user: user.displayName ? user.displayName : "Não Identificado",
              email: user.email,
              data: timestamp.toISOString(),
              action: `Usuário ${user.email} deletou corretor ${id}`,
            });
          } catch (error) {
            console.error("Erro ao deletar corretor", error);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao deletar imóvel:", error);
    } finally {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={handleClose} className="text-gray-600 hover:text-gray-900">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 text-base">{description}</p>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Fechar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-black rounded-md text-white hover:bg-black/80"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}
