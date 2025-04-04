export function MapsLocator({ latitude, longitude, title = "Mapa de localização" }) {
  // Usando a URL padrão do Google Maps que não requer chave de API
  // Esta abordagem mostra um pin na localização com zoom máximo
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d500!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${latitude}%2C${longitude}!5e0!3m2!1spt-BR!2sbr!4v1614061535532!5m2!1spt-BR!2sbr`;

  return (
    <div className="w-full h-96">
      <iframe
        src={mapUrl}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
      ></iframe>
    </div>
  );
}
