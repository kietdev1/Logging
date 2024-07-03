import { MongoClient } from 'mongodb'

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable')
}

let cacheClient: MongoClient | null = null;

export async function connectToDatabase() {
    if (cacheClient) {
        const db = cacheClient.db(MONGODB_DB);
        return { client: cacheClient, db };
    }
    const client = await MongoClient.connect(MONGODB_URI as string);
    cacheClient = client;

    const db = client.db(MONGODB_DB)

    return { client, db }
}