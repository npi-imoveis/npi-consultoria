"use client";

import Link from "next/link";
import { useState } from "react";

const Modal = ({ title, onClose, children, description, buttonText, link }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleRedirect = () => {
    if (link) {
      window.open(link, "_blank");
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

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

        {children && <div className="p-4">{children}</div>}
        {!children && (
          <div className="p-4">
            <p>{description}</p>
          </div>
        )}
        <div className="w-full flex justify-end p-4">
          <button
            onClick={handleRedirect}
            className="bg-black text-white px-4 py-2 rounded hover:bg-opacity-80 transition duration-300"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
