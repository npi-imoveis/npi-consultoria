import { Schema, model, models } from 'mongoose';

interface ICadimo {
    CORRETORES_DO_IMOVEL?: string;
    DATAP_01?: string;
    DATAP_02?: string;
    DATAP_03?: string;
    DATAP_04?: string;
    DATAP_05?: string;
    EMAIL_01?: string;
    EMAIL_02?: string;
    EMAIL_03?: string;
    EMAIL_04?: string;
    EMAIL_05?: string;
    FONE_P01?: string;
    FONE_P02?: string;
    FONE_P03?: string;
    FONE_P04?: string;
    FONE_P05?: string;
    M2_01?: string;
    M2_02?: string;
    M2_03?: string;
    M2_04?: string;
    M2_05?: string;
    NOME01?: string;
    NOME02?: string;
    NOME03?: string;
    NOME04?: string;
    NOME05?: string;
    NUM_ENDERECO?: string;
    OBS_P01?: string;
    OBS_P02?: string;
    OBS_P03?: string;
    OBS_P04?: string;
    OBS_P05?: string;
    PLACA?: string;
    UNIDADE_01?: string;
    UNIDADE_02?: string;
    UNIDADE_03?: string;
    UNIDADE_04?: string;
    UNIDADE_05?: string;
    VALORP_01?: string;
    VALORP_02?: string;
    VALORP_03?: string;
    VALORP_04?: string;
    VALORP_05?: string;
    VAGASP_01?: string;
    VAGASP_02?: string;
    VAGASP_03?: string;
    VAGASP_04?: string;
    VAGASP_05?: string;
    VLR_CONDOMINIO?: number;
    VLR_IPTU?: number;
}

const CadimoSchema = new Schema<ICadimo>({
    CORRETORES_DO_IMOVEL: String,
    DATAP_01: String,
    DATAP_02: String,
    DATAP_03: String,
    DATAP_04: String,
    DATAP_05: String,
    EMAIL_01: String,
    EMAIL_02: String,
    EMAIL_03: String,
    EMAIL_04: String,
    EMAIL_05: String,
    FONE_P01: String,
    FONE_P02: String,
    FONE_P03: String,
    FONE_P04: String,
    FONE_P05: String,
    M2_01: String,
    M2_02: String,
    M2_03: String,
    M2_04: String,
    M2_05: String,
    NOME01: String,
    NOME02: String,
    NOME03: String,
    NOME04: String,
    NOME05: String,
    NUM_ENDERECO: String,
    OBS_P01: String,
    OBS_P02: String,
    OBS_P03: String,
    OBS_P04: String,
    OBS_P05: String,
    PLACA: String,
    UNIDADE_01: String,
    UNIDADE_02: String,
    UNIDADE_03: String,
    UNIDADE_04: String,
    UNIDADE_05: String,
    VALORP_01: String,
    VALORP_02: String,
    VALORP_03: String,
    VALORP_04: String,
    VALORP_05: String,
    VAGASP_01: String,
    VAGASP_02: String,
    VAGASP_03: String,
    VAGASP_04: String,
    VAGASP_05: String,
    VLR_CONDOMINIO: Number,
    VLR_IPTU: Number,
},
    {
        timestamps: true,
        collection: 'cadimo',
        strict: false,
    }

);

const Cadimo = models.Cadimo || model<ICadimo>("Cadimo", CadimoSchema);

export default Cadimo;



