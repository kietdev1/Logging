import { connectToDatabase } from '@/lib/mongodb/mongodb'
import Log from '@/lib/types/Log';
import { NextApiRequest, NextApiResponse } from 'next'

const { MONGODB_COLLECTION } = process.env

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
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

            res.status(200).json(logs)
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching logs' })
        }
    } else {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}