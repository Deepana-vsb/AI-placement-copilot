const { MongoClient } = require('mongodb');

const uri = "mongodb://mongo:zdzyYkDXelHOGyuKcUoDsVSXgmchtTpe@66.33.22.223:13474/placement_copilot?authSource=admin";

async function run() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db("placement_copilot");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
