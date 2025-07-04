import mongoose from 'mongoose';

const ImovelSchema = new mongoose.Schema({
  Codigo: { type: Number, required: true, unique: true },
  Slug: { type: String, required: true },
  // Adicione outros campos conforme necessário
});

export default mongoose.models.Imovel || mongoose.model('Imovel', ImovelSchema);
