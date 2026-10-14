import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Campaign {
  _id: string;
  name: string;
  platform: string;
  totalBudget: number;
  spent: number;
  milestones: { views: number; payout: number }[];
  isActive: boolean;
  createdAt: string;
}

export default function BrandDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Instagram',
    totalBudget: '',
    milestones: [{ views: '', payout: '' }]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'brand') {
      router.push('/');
      return;
    }

    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/my-campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      const milestones = formData.milestones.map(m => ({
        views: parseInt(m.views),
        payout: parseInt(m.payout)
      }));

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`, {
        name: formData.name,
        platform: formData.platform,
        totalBudget: parseInt(formData.totalBudget),
        milestones
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowForm(false);
      setFormData({
        name: '',
        platform: 'Instagram',
        totalBudget: '',
        milestones: [{ views: '', payout: '' }]
      });
      fetchCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    }
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { views: '', payout: '' }]
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/')} className="text-xl font-bold text-gray-900">
                Meme'd
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/');
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand Dashboard</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Create Campaign'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (₹)</label>
                <input
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Milestones</label>
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="number"
                      placeholder="Views"
                      value={milestone.views}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[index].views = e.target.value;
                        setFormData({ ...formData, milestones: newMilestones });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Payout (₹)"
                      value={milestone.payout}
                      onChange={(e) => {
                        const newMilestones = [...formData.milestones];
                        newMilestones[index].payout = e.target.value;
                        setFormData({ ...formData, milestones: newMilestones });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="0"
                    />
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMilestone}
                  className="mt-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Add Milestone
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Campaign
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
              <p className="text-gray-600 mb-2">Platform: {campaign.platform}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Spent</span>
                  <span>₹{campaign.spent} / ₹{campaign.totalBudget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(campaign.spent / campaign.totalBudget) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Milestones:</p>
                {campaign.milestones.map((m, i) => (
                  <p key={i}>{m.views.toLocaleString()} views → ₹{m.payout}</p>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Status: {campaign.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No campaigns yet. Create your first campaign!</p>
          </div>
        )}
      </main>
    </div>
  );
}
