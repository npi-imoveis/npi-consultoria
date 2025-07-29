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
export default function DiferenciaisCondominio({ condominio }) {
    const diferenciasCondominio = formatarHtml(condominio.DescricaoDiferenciais);
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <h2 className="text-xl font-bold text-black">
                Sobre o Condomínio {condominio.Empreendimento}
            </h2>
            <div
                className="text-sm mt-6 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: diferenciasCondominio }}
            />
        </div>
    );
}
