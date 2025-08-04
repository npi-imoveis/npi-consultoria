"use client";
import Link from "next/link";

export function Button({ link, text, style = "primary", onClick = () => { }, target }) {
  // Define classes based on style prop
  const getButtonClasses = () => {
    const baseClasses =
      "inline-flex justify-center items-center tracking-wide gap-2 px-6 py-2 focus:outline-none focus:ring transition-all duration-300 ease-in-out";
    switch (style) {
      case "primary":
        return `${baseClasses} bg-black border border-black text-white hover:bg-transparent hover:text-black rounded-full`;
      case "secondary":
        return `${baseClasses} text-black bg-transparent border-none hover:opacity-80 rounded-full`;
      case "special":
        return `${baseClasses} bg-[#8B6F48] text-white hover:bg-opacity-90 rounded`;
      default:
        return `${baseClasses} bg-black border border-black text-white hover:bg-transparent hover:text-black rounded-full`;
    }
  };
  
  // Função para lidar com o clique
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };
  
  // Se não tiver link, renderiza um botão comum
  if (!link) {
    return (
      <button className={getButtonClasses()} onClick={handleClick} type="button">
        <span className="text-[10px] font-semibold uppercase"> {text} </span>
        <svg
          className="size-5 rtl:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </button>
    );
  }
  
  // Com link, renderiza como Link
  return (
    <Link 
      className={getButtonClasses()} 
      href={link} 
      onClick={handleClick} 
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
    >
      <span className="text-[10px] font-semibold uppercase"> {text} </span>
      <svg
        className="size-5 rtl:rotate-180"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </Link>
  );
}
