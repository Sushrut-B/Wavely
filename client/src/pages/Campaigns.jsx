export default function Campaigns() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Campaigns</h1>
        <button className="btn btn-primary">+ New Campaign</button>
      </div>

      <div className="card">
        <p className="text-gray-600">Campaign management features coming soon...</p>
      </div>

      {/* Campaign List Placeholder */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-dark">Sample Campaign {i}</h3>
                <p className="text-sm text-gray-600">Status: Active • Messages: 1,234</p>
              </div>
              <button className="text-primary hover:text-green-600">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
