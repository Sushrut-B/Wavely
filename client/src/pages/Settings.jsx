export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Settings</h1>

      {/* Tabs */}
      <div className="card border-b">
        <div className="flex space-x-8">
          <button className="pb-3 border-b-2 border-primary text-primary font-medium">
            General
          </button>
          <button className="pb-3 text-gray-600 hover:text-dark">
            WhatsApp API
          </button>
          <button className="pb-3 text-gray-600 hover:text-dark">
            Billing
          </button>
          <button className="pb-3 text-gray-600 hover:text-dark">
            Security
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="card">
        <h3 className="text-lg font-bold text-dark mb-6">Organization Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-dark font-medium mb-2">Organization Name</label>
            <input type="text" className="input" placeholder="My Company" />
          </div>
          <div>
            <label className="block text-dark font-medium mb-2">Business Email</label>
            <input type="email" className="input" placeholder="business@company.com" />
          </div>
          <div>
            <label className="block text-dark font-medium mb-2">Phone Number</label>
            <input type="tel" className="input" placeholder="+91 98765 43210" />
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>

      {/* Subscription */}
      <div className="card">
        <h3 className="text-lg font-bold text-dark mb-4">Current Plan</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-dark">Professional Plan</p>
            <p className="text-sm text-gray-600">₹999/month • Renews on June 11, 2024</p>
          </div>
          <button className="btn btn-secondary">Upgrade Plan</button>
        </div>
      </div>
    </div>
  );
}
