import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

// Don't throw error during build time - let it fail gracefully
if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn("MONGODB_URI not defined - this is expected during build time");
}


let cached = global.mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // Return early if MONGODB_URI is not defined (during build time)
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not defined - skipping database connection");
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "npi",
      bufferCommands: false,
      maxPoolSize: 10,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
