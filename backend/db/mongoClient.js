import { MongoClient } from "mongodb";

const DEFAULT_URI =
  "mongodb+srv://souravspy_db_user:" +
  encodeURIComponent("Sourav@1996") +
  "@cluster0.fasb47g.mongodb.net/";
const DEFAULT_DB = "GrillAndGo";

const uri = process.env.MONGODB_URI || DEFAULT_URI;
const dbName = process.env.MONGODB_DB || DEFAULT_DB;

let client;

export const getDb = async () => {
  if (!client) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
  }

  return client.db(dbName);
};

export const closeDb = async () => {
  if (client) {
    await client.close();
    client = undefined;
  }
};
