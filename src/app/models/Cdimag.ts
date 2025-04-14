import { Schema, model, models } from 'mongoose';

interface ICdimag {
    numero: number;
    codigoO: number;
    codigoD: number;
    prcntLc: number;
    prcntLcan: number;
    prcntVn: number;
    valorLc: number;
    valorLcan: number;
    valorVn: number;
    valorLcN: number;
    valorLcanN: number;
    valorVnN: number;
    tipo: string;
    data: string;
    tipoComissao: string;
    comissao: string;
}

const CdimagSchema = new Schema<ICdimag>({
    numero: Number,
    codigoO: Number,
    codigoD: Number,
    prcntLc: Number,
    prcntLcan: Number,
    prcntVn: Number,
    valorLc: Number,
    valorLcan: Number,
    valorVn: Number,
    valorLcN: Number,
    valorLcanN: Number,
    valorVnN: Number,
    tipo: String,
    data: String,
    tipoComissao:String,
    comissao: String
},
{
    timestamps: true,
    collection: 'cdimag',
    strict: false,
}
);

export const Cdimag = models.Cdimag || model('Cdimag', CdimagSchema);

export default Cdimag;

