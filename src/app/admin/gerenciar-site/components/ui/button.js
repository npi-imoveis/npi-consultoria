"use client";

export default function Button({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`mt-4 bg-black px-4 py-2 text-white rounded-md disabled:bg-gray-400 ${className}`}
    >
      {children}
    </button>
  );
}
