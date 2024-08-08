import { addHours } from '@/lib/extensions/DateHelper';
import { connectToDatabase } from '@/lib/mongodb/mongodb';
import Log from '@/lib/types/Log';
import { cache } from 'react';

const { MONGODB_COLLECTION } = process.env

const getLogs = cache(async (limit: number) => {
  const { db } = await connectToDatabase();

  const logs = await db.collection<Log>(MONGODB_COLLECTION ?? 'Logs')
    .find()
    .sort({ _id: -1 })
    .limit(limit)
    .project({ RenderedMessage: 0, 'Properties.Message': 0 })
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
  return logs;
})

type Props = {
  params: { comicid: string | null, locale: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams: { limit } }: Props) {
  let limitQuery = 20;

  try {
    if (limit) {
      limitQuery = Number.parseInt(String(limit));
    }
  }
  catch (error) {
    limitQuery = 25;
  }

  const logs = await getLogs(limitQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Logs</h1>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 w-[15%]">Level</th>
              <th scope="col" className="px-6 py-3 w-[65%]">Message</th>
              <th scope="col" className="px-6 py-3 w-[20%]">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={log._id}
                className={`${(index + 1) % 10 === 0 ? 'bg-blue-50' : 'bg-white'} border-b hover:bg-gray-50`}>
                <td className="px-6 py-4">
                  <span className="flex items-center">
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${log.Level === 'Information' ? 'bg-green-100 text-green-800' :
                      log.Level === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {log.Level}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="break-words whitespace-normal">{log.Message}</div>
                </td>
                <td className="px-6 py-4">
                  {(addHours(new Date(log.Timestamp), 7)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div >
      <div className="flex justify-center mt-5">
        <a id="more" className="flex items-center px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:shadow-outline disabled:opacity-50"
          href={`/?limit=${logs.length + 10}`}>Load More</a>
      </div>
    </div>
  );
}
