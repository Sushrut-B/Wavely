export default function Contacts() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Contacts</h1>
        <div className="space-x-3">
          <button className="btn btn-primary">+ Add Contact</button>
          <button className="btn btn-secondary">Import CSV</button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <input
          type="text"
          placeholder="Search contacts..."
          className="input"
        />
      </div>

      {/* Contacts Table Placeholder */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Phone Number</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Tags</th>
              <th className="text-left py-3 px-4 font-semibold">Last Message</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">Contact {i}</td>
                <td className="py-3 px-4">+91 98765 4321{i}</td>
                <td className="py-3 px-4">contact{i}@example.com</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    VIP
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">2 days ago</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
