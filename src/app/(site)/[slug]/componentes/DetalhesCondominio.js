import React from 'react';

const DetalhesCondominio = ({ imovel }) => {
  const estilos = {
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '20px auto',
      padding: '0 20px'
    },
    secao: {
      marginBottom: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    titulo: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '2px solid #007bff'
    },
    conteudo: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#555',
      whiteSpace: 'pre-wrap'
    }
  };

  return (
    <div style={estilos.container}>
      {/* Seção: Sobre o Condomínio */}
      {imovel.DescricaoDiferenciais && (
        <div style={estilos.secao}>
          <h2 style={estilos.titulo}>Sobre o Condomínio</h2>
          <div style={estilos.conteudo}>
            {imovel.DescricaoDiferenciais}
          </div>
        </div>
      )}

      {/* Seção: Destaques e Diferenciais */}
      {imovel.DestaquesDiferenciais && (
        <div style={estilos.secao}>
          <h2 style={estilos.titulo}>Destaques e Diferenciais</h2>
          <div style={estilos.conteudo}>
            {imovel.DestaquesDiferenciais}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalhesCondominio;
