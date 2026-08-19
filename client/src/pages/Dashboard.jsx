import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', messages: 400, campaigns: 24, delivered: 2400 },
  { month: 'Feb', messages: 300, campaigns: 13, delivered: 2210 },
  { month: 'Mar', messages: 200, campaigns: 9, delivered: 2290 },
  { month: 'Apr', messages: 278, campaigns: 39, delivered: 2000 },
  { month: 'May', messages: 189, campaigns: 48, delivered: 2181 },
  { month: 'Jun', messages: 239, campaigns: 37, delivered: 2500 },
];

export default function Dashboard() {
  const stats = [
    { label: 'Total Messages', value: '1,524', change: '+12%' },
    { label: 'Active Campaigns', value: '8', change: '+2' },
    { label: 'Contacts', value: '2,345', change: '+156' },
    { label: 'Agents Online', value: '5', change: '+1' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card">
            <p className="text-gray-600 mb-2">{stat.label}</p>
            <div className="flex justify-between items-end">
              <h3 className="text-3xl font-bold text-dark">{stat.value}</h3>
              <span className="text-primary text-sm font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-dark mb-4">Messages Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="messages" fill="#25D366" />
            <Bar dataKey="delivered" fill="#34495E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-dark mb-4">Recent Campaigns</h3>
          <div className="space-y-3">
            <div className="border-b pb-3">
              <p className="font-medium text-dark">Summer Sale Campaign</p>
              <p className="text-sm text-gray-600">2,450 messages sent</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium text-dark">Newsletter - May 2024</p>
              <p className="text-sm text-gray-600">1,234 delivered</p>
            </div>
            <div>
              <p className="font-medium text-dark">OTP Verification</p>
              <p className="text-sm text-gray-600">5,678 OTPs sent</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-dark mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="btn btn-primary w-full">Create Campaign</button>
            <button className="btn btn-secondary w-full">Start Broadcast</button>
            <button className="btn btn-secondary w-full">View Contacts</button>
          </div>
        </div>
      </div>
    </div>
  );
}
