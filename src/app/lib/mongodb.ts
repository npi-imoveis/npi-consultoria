import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;


export async function connectToDatabase() {
  const options = {
    dbName: "npi",
  };
  
  return await mongoose.connect(MONGODB_URI, options);
}

export async function connectToDatabaseAutomacao() {
  const options = {
    dbName: "npi",
  };
  
  return await mongoose.connect(MONGODB_URI, options);
}