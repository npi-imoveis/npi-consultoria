import Content from "../models/Content";
import { connectToDatabase } from "./mongodb";

export default async function getContent() {
  await connectToDatabase();
  const content = await Content.findOne({}).lean();

  if (!content) {
    throw new Error("Conteúdo não encontrado no banco de dados");
  }

  // Função para transformar _id em string recursivamente
  const convertIdsToStrings = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(convertIdsToStrings);
    } else if (obj && typeof obj === "object") {
      const newObj = {};
      for (const key of Object.keys(obj)) {
        if (key === "_id") {
          newObj[key] = obj[key].toString(); // Converte _id para string
        } else {
          newObj[key] = convertIdsToStrings(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  };

  // Transforma o objeto content
  return convertIdsToStrings(content);
}
