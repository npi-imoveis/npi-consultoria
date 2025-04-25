import { get } from "@vercel/edge-config";

export async function getContentHome() {
    const keys = [
        "sobre_titulo",
        "sobre_subtitulo",
        "sobre_descricao",
        "sobre_page_title",
        "sobre_page_descricao",
        "sobre_page_title2",
        "sobre_page_descricao2"
    ];

    const content = {};

    for (const key of keys) {
        const value = await get(key);
        if (value) content[key] = value;
    }

    return content;
}


export async function getContentSobre() {
    const keys = [
        "sobre_page_titulo",
        "sobre_page_descricao",
        "sobre_page_titulo1",
        "sobre_page_descricao2",
        "sobre_page_howto_title",
        "sobre_page_howto_description",
        "sobre_page_howto_title2",
        "sobre_page_howto_description2",
        "sobre_page_howto_title3",
        "sobre_page_howto_description3"
    ];

    const content = {};

    for (const key of keys) {
        const value = await get(key);
        if (value) content[key] = value;
    }
    return content;

}

export async function getContentFaq() {
    const keys = [
        "faq_question_1",
        "faq_answer_1",
        "faq_question_2",
        "faq_answer_2",
        "faq_question_3",
        "faq_answer_3",
        "faq_question_4",
        "faq_answer_4",

    ]
    const content = {};

    for (const key of keys) {
        const value = await get(key);
        if (value) content[key] = value;
    }
    return content;
}


export async function getContentSobreNpi() {
    const keys = [
        "sobrenpi_header_title",
        "sobrenpi_header_subtitle",
        "sobrenpi_title",
        "sobrenpi_description",
        "sobrenpi_ano_title",
        "sobrenpi_ano_description",
        "sobrenpi_ano1_title",
        "sobrenpi_ano1_description",
        "sobrenpi_ano2_title",
        "sobrenpi_ano2_description",
        "sobrenpi_ano3_title",
        "sobrenpi_ano3_description",
        "sobrenpi_missao_title",
        "sobrenpi_missao_description",
        "sobrenpi_missao1_title",
        "sobrenpi_missao1_description",
        "sobrenpi_missao2_title",
        "sobrenpi_missao2_description",
        "sobrenpi_missao3_title",
        "sobrenpi_missao3_description",
        "sobrenpi_missao4_title",
        "sobrenpi_missao4_description"
    ]

    const content = {};

    for (const key of keys) {
        const value = await get(key);
        if (value) content[key] = value;
    }

    return content;
}


export async function getContentStats() {
    const keys = [
        "stats_position",
        "stats_views",
        "stats_clicks",
        "stats_partners",
        "stats_properties"
    ]

    const content = {};

    for (const key of keys) {
        const value = await get(key);
        if (value) content[key] = value;
    }

    return content;
}
