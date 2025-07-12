import mongoose, { Schema, model, models } from "mongoose";

export interface IContent {
    sobre: {
        titulo: string;
        subtitulo: string;
        descricao: string;
        image_url: string;
    };
    sobre_hub: {
        header: string;
        header_descricao: string;
        descricao: string;
        descricao2: string;
        titulo: string;
        titulo1: string;
        howto: Array<{
            title: string;
            description: string;
        }>;
    };
    faq: Array<{
        question: string;
        answer: string;
    }>;
    sobre_npi: {
        title: string;
        description: string;
        historia: Array<{
            ano: string;
            title: string;
            description: string;
            image: string;
        }>;
        missao: {
            youtube: string;
            title: string;
            description: string;
            itens: Array<{
                title: string;
                description: string;
            }>;
        };
        header: {
            title: string;
            subtitle: string;
        };
    };
    stats: {
        position: string;
        views: string;
        clicks: string;
        partners: string;
        properties: string;
    };
    cards_destacados: Array<{
        title: string;
        description: string;
    }>;
    servicos: Array<{
        title: string;
        descricao: string;
    }>;
    testemunhos: Array<{
        id: number;
        content: string;
        name: string;
        role: string;
        avatar: string;
    }>;
    createdAt?: Date;
    updatedAt?: Date;
}

const ContentSchema = new Schema(
    {
        sobre: {
            titulo: String,
            subtitulo: String,
            descricao: String,
            image_url: String,
        },
        sobre_hub: {
            header: String,
            header_descricao: String,
            descricao: String,
            descricao2: String,
            titulo: String,
            titulo1: String,
            howto: [
                {
                    title: String,
                    description: String,
                },
            ],
        },
        faq: [
            {
                question: String,
                answer: String,
            },
        ],
        sobre_npi: {
            title: String,
            description: String,
            historia: [
                {
                    ano: String,
                    title: String,
                    description: String,
                    image: String,
                },
            ],
            missao: {
                youtube: String,
                title: String,
                description: String,
                itens: [
                    {
                        title: String,
                        description: String,
                    },
                ],
            },
            header: {
                title: String,
                subtitle: String,
            },
        },
        stats: {
            position: String,
            views: String,
            clicks: String,
            partners: String,
            properties: String,
        },
        cards_destacados: [
            {
                title: String,
                description: String,
            },
        ],
        servicos: [
            {
                title: String,
                descricao: String,
            },
        ],
        testemunhos: [
            {
                id: Number,
                content: String,
                name: String,
                role: String,
                avatar: String,
            },
        ],
    },
    {
        timestamps: true,
        collection: "site",
        strict: false,
    }
);

const Content = models.Content || model("Content", ContentSchema);

export default Content;  
