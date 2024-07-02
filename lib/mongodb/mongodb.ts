import { MongoClient } from 'mongodb'

const { MONGODB_URI, MONGODB_DB } = process.env

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable')
}


export async function connectToDatabase() {
    const client = await MongoClient.connect(MONGODB_URI as string)
    const db = client.db(MONGODB_DB)

    return { client, db }
}