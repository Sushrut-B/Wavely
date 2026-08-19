export default function Agents() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Agents</h1>
        <button className="btn btn-primary">+ Add Agent</button>
      </div>

      {/* Agents Table Placeholder */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Agent Name</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Chats</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">Agent {i}</td>
                <td className="py-3 px-4">agent{i}@company.com</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                    Online
                  </span>
                </td>
                <td className="py-3 px-4">12</td>
                <td className="py-3 px-4">
                  <button className="text-primary hover:text-green-600">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
