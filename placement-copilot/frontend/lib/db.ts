import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  // In development, we use a global variable to avoid exhausting connections.
  if (process.env.NODE_ENV === "development") {
    if (global._mongoClient && global._mongoDb) {
      return { client: global._mongoClient, db: global._mongoDb };
    }
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  if (process.env.NODE_ENV === "development") {
    global._mongoClient = client;
    global._mongoDb = db;
  }

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
