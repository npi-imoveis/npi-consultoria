// Estilos padronizados para seções
export const sectionStyles = {
  // Classe base para todas as seções
  section: "py-16 px-6 md:px-8 lg:px-10",

  // Container dentro da seção
  container: "container mx-auto max-w-7xl",

  // Espaçamentos de texto
  textSpacing: {
    title: "text-3xl md:text-4xl font-bold mb-6",
    subtitle: "text-xl md:text-2xl font-semibold mb-4",
    paragraph: "text-base leading-relaxed mb-6",
    smallText: "text-sm leading-relaxed mb-4",
  },

  // Espaçamentos para componentes
  componentSpacing: {
    sm: "my-2 md:my-3",
    md: "my-4 md:my-6",
    lg: "my-6 md:my-8",
    xl: "my-8 md:my-12",
  },

  // Layouts específicos
  layouts: {
    twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-8",
    threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    fourColumn: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  },

  // Variantes de seção
  variants: {
    light: "bg-white text-black",
    dark: "bg-black text-white",
    primary: "bg-[#8B6F4B] text-white",
    secondary: "bg-zinc-100 text-black",
  },
};
