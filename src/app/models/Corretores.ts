import mongoose, { Schema, model, models } from "mongoose";

export interface ICorretores {
    nome: string;
    codigoD: string;
    rg: string;
    cpf: string;
    nascimento: string;
    nacional: string;
    sexo: string;
    cnh: string;
    celular: string;
    creci: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    pais: string;
    fone: string;
    email: string;
    estCivil: string;
    imoveis_vinculados: [];
};
const CorretoresSchema = new Schema({
    nome: String,
    codigoD: String,
    inativo: String,
    rg: String,
    cpf: String,
    nascimento: String,
    nacional: String,
    estCivil: String,
    sexo: String,
    cnh: String,
    creci: String,
    celular: String,
    endereco: String,
    email: String,
    bairro: String,
    cidade: String,
    uf: String,
    cep: String,
    pais: String,
    fone: String,
    imoveis_vinculados: {
        type: Array,
        default: []
    }
},
    {
        timestamps: true,
        collection: 'corretores',
        strict: false,
    }
);

const Corretores = models.Corretores || model('Corretores', CorretoresSchema);

export default Corretores;


