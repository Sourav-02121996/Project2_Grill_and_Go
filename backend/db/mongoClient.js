import { MongoClient } from 'mongodb';

const DEFAULT_URI = 'mongodb://localhost:37017';
const DEFAULT_DB = 'grillandgo';

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
