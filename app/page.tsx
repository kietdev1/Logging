import { addHours } from '@/lib/extensions/DateHelper';
import { connectToDatabase } from '@/lib/mongodb/mongodb';
import Log from '@/lib/types/Log';
import { unstable_cache } from 'next/cache';

const { MONGODB_COLLECTION } = process.env

const getLogs = unstable_cache(async () => {
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
  return logs;
}, [], { revalidate: 5 });

export default async function Home() {
  const logs = await getLogs();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Logs</h1>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Timestamp</th>
              <th scope="col" className="px-6 py-3">Message</th>
              <th scope="col" className="px-6 py-3">Level</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  {(addHours(new Date(log.Timestamp), 7)).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {log.Message}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
