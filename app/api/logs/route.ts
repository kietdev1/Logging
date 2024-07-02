import { connectToDatabase } from '@/lib/mongodb/mongodb'
import Log from '@/lib/types/Log';
import { NextResponse } from 'next/server';

const { MONGODB_COLLECTION } = process.env

export async function GET(request: Request) {
    try {
        const { db } = await connectToDatabase();

        const logs = await db.collection<Log>(MONGODB_COLLECTION ?? 'Logs')
            .find({})
            .sort({ Timestamp: -1 })
            .limit(25)
            .map((doc) => {
                if (doc.MessageTemplate) {
                    doc.Message = doc.MessageTemplate?.replace('{@Environment}', doc.Properties?.Environment ?? '')
                        ?.replace('{@ServiceName}', doc.Properties?.ServiceName ?? '')
                        ?.replace('{@EventName}', doc.Properties?.EventName ?? '')
                        ?.replace('{@Description}', doc.Properties?.Description ?? '')
                        ;
                }

                return doc;
            })
            .toArray();

        return NextResponse.json(logs)
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error fetching logs' })
    }
}