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
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'Instagram',
    totalBudget: '',
    milestones: [{ views: '', payout: '' }],
    isActive: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
      const milestones = formData.milestones.map(m => ({
        views: parseInt(m.views),
        payout: parseInt(m.payout)
      }));

      if (editingCampaign) {
        // Update existing campaign
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${editingCampaign._id}`, {
          name: formData.name,
          platform: formData.platform,
          totalBudget: parseInt(formData.totalBudget),
          milestones,
          isActive: formData.isActive
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new campaign
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns`, {
          name: formData.name,
          platform: formData.platform,
          totalBudget: parseInt(formData.totalBudget),
          milestones
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowForm(false);
      setEditingCampaign(null);
      setFormData({
        name: '',
        platform: 'Instagram',
        totalBudget: '',
        milestones: [{ views: '', payout: '' }],
        isActive: true
      });
      fetchCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.error || editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign');
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      platform: campaign.platform,
      totalBudget: campaign.totalBudget.toString(),
      milestones: campaign.milestones.map(m => ({ views: m.views.toString(), payout: m.payout.toString() })),
      isActive: campaign.isActive
    });
    setShowForm(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This can only be done if no budget has been spent.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete campaign');
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
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => router.push('/')} className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meme'd
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  sessionStorage.removeItem('token');
                  sessionStorage.removeItem('user');
                  router.push('/');
                }}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
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
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setEditingCampaign(null);
                setFormData({
                  name: '',
                  platform: 'Instagram',
                  totalBudget: '',
                  milestones: [{ views: '', payout: '' }],
                  isActive: true
                });
              }
            }}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : 'Create Campaign'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
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
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="input-field"
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
                  className="input-field"
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
                      className="flex-1 input-field"
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
                      className="flex-1 input-field"
                      required
                      min="0"
                    />
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMilestone}
                  className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Add Milestone
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Campaign is active
                </label>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </form>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {campaigns.filter(c => c.isActive && c.spent < c.totalBudget).map((campaign) => (
            <div key={campaign._id} className="card">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{campaign.name}</h3>
              <p className="text-gray-600 mb-2">Platform: {campaign.platform}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Budget Spent</span>
                  <span className="font-medium">₹{campaign.spent} / ₹{campaign.totalBudget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
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
              <p className="mt-4 text-sm">
                Status: <span className="font-medium text-green-600">Active</span>
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditCampaign(campaign)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCampaign(campaign._id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  disabled={campaign.spent > 0}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {campaigns.filter(c => c.isActive && c.spent < c.totalBudget).length === 0 && !showForm && (
          <div className="text-center py-12 card mb-12">
            <p className="text-gray-500 text-lg">No active campaigns. Create your first campaign!</p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.filter(c => !c.isActive || c.spent >= c.totalBudget).map((campaign) => (
            <div key={campaign._id} className="card border-2 border-green-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Completed</span>
              </div>
              <p className="text-gray-600 mb-2">Platform: {campaign.platform}</p>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Budget Spent</span>
                  <span className="font-medium">₹{campaign.spent} / ₹{campaign.totalBudget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
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
              <p className="mt-4 text-sm">
                Status: <span className="font-medium text-green-600">
                  {campaign.spent >= campaign.totalBudget ? 'Budget Exhausted' : 'Inactive'}
                </span>
              </p>
              <div className="mt-4">
                <button
                  onClick={() => handleEditCampaign(campaign)}
                  className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {campaigns.filter(c => !c.isActive || c.spent >= c.totalBudget).length === 0 && (
          <div className="text-center py-12 card">
            <p className="text-gray-500 text-lg">No completed campaigns yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
