import mongoose, { Schema, model, models } from "mongoose";

export interface IProprietarios {
    nome: string;
    codigoC: string;
    status: string;
    fonePrincipal: string;
    foneAntigo: string;
    emailR: string,
    veiculoCaptacao: string,
    produto: string,
}

const ProprietariosSchema = new Schema({
    nome: String,
    codigoC: String,
    status: String,
    fonePrincipal: String,
    foneAntigo: String,
    emailR: String,
    veiculoCaptacao: String,
    produto: String,
},
    {
        timestamps: true,
        collection: 'proprietarios',
        strict: false,
    }
);

const Proprietarios = models.Proprietarios || model('Proprietarios', ProprietariosSchema);

export default Proprietarios;


