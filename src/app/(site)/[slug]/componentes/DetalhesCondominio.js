import React from 'react';

const DetalhesCondominio = ({ imovel }) => {
  return (
    <div className="detalhes-condominio">
      {/* Seção: Sobre o Condomínio */}
      {imovel.DescricaoDiferenciais && (
        <div className="secao-descricao">
          <h2>Sobre o Condomínio</h2>
          <div className="conteudo">
            <p>{imovel.DescricaoDiferenciais}</p>
          </div>
        </div>
      )}

      {/* Seção: Destaques e Diferenciais */}
      {imovel.DestaquesDiferenciais && (
        <div className="secao-destaques">
          <h2>Destaques e Diferenciais</h2>
          <div className="conteudo">
            <p>{imovel.DestaquesDiferenciais}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesCondominio;
