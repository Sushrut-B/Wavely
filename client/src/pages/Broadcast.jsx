export default function Broadcast() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Broadcast Messages</h1>
        <button className="btn btn-primary">+ New Broadcast</button>
      </div>

      <div className="card">
        <p className="text-gray-600">Send messages at scale to your contact list.</p>
      </div>

      {/* Broadcast List Placeholder */}
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-dark">Broadcast #{i}</h3>
                <p className="text-sm text-gray-600">Recipients: 500 • Status: In Progress</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary">234/500 sent</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
