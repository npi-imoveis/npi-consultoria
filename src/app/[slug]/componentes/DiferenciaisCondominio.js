"use client";

const formatarHtml = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\r\n|\r|\n/g, "<br />");
};

export default function DiferenciaisCondominio({ condominio }) {
    const diferenciasCondominio = formatarHtml(condominio.DescricaoDiferenciais);
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <h2 className="text-xl font-bold text-black">
                Diferenciais do Condomínio {condominio.Empreendimento}{" "}
            </h2>
            <h4 className="text-sm mt-6" dangerouslySetInnerHTML={{ __html: diferenciasCondominio }} />
        </div>
    );
} 