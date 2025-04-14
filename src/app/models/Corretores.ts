import mongoose, { Schema, model, models } from "mongoose";

export interface ICorretores{
    nomeCompleto: string;
    codigoD: string;
    inativo: string;
    rg: string;
    cpf: string;
    nascimento: string;
    nacional: string;
    estCivil: string;
    sexo: string;
    cnh: string;
    creci: string;
    celular: string;
    endereco: string;
    email: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    pais: string;
    fone: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CorretoresSchema = new Schema({
    nomeCompleto: String,
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
},
{
    timestamps: true,
    collection: 'corretores',
    strict: false,
}
);

const Corretores = models.Corretores || model('Corretores', CorretoresSchema);

export default Corretores;


