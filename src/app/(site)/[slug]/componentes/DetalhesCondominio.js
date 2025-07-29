"use client";

const formatarHtml = (htmlString) => {
  if (!htmlString) return "";
  // Sanitize the input by removing any HTML tags first
  const sanitizedString = htmlString.replace(/<[^>]*>/g, '');
  // Convert newlines to <br /> tags more safely
  const formattedString = sanitizedString
    .split(/\r?\n/)
    .filter(line => line.trim() !== '')
    .join('<br />');
  return formattedString;
};

const DetalhesCondominio = ({ imovel }) => {
  const descricaoCondominio = formatarHtml(imovel.DescricaoDiferenciais);
  const destaquesCondominio = formatarHtml(imovel.DestaquesDiferenciais);

  return (
    <>
      {/* Seção: Sobre o Condomínio */}
      {imovel.DescricaoDiferenciais && (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
          <h2 className="text-xl font-bold text-black">
            Sobre o Condomínio {imovel.Empreendimento}
          </h2>
          <div 
            className="text-sm mt-6 whitespace-pre-line" 
            dangerouslySetInnerHTML={{ __html: descricaoCondominio }} 
          />
        </div>
      )}

      {/* Seção: Destaques e Diferenciais */}
      {imovel.DestaquesDiferenciais && (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
          <h2 className="text-xl font-bold text-black">
            Destaques e Diferenciais
          </h2>
          <div 
            className="text-sm mt-6 whitespace-pre-line" 
            dangerouslySetInnerHTML={{ __html: destaquesCondominio }} 
          />
        </div>
      )}
    </>
  );
};

export default DetalhesCondominio;
