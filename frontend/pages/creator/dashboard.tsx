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
}

interface Submission {
  _id: string;
  campaignId: Campaign | string;
  postLink: string;
  views: number;
  payout: number;
  createdAt: string;
}

export default function CreatorDashboard() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [postLink, setPostLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'creator') {
      router.push('/');
      return;
    }

    fetchCampaigns();
    fetchSubmissions();
    fetchEarnings();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/my-submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/my-earnings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotalEarnings(response.data.totalEarnings);
    } catch (err: any) {
      console.error('Error fetching earnings:', err);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions`, {
        campaignId: selectedCampaign,
        postLink
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowSubmitForm(false);
      setSelectedCampaign('');
      setPostLink('');
      fetchSubmissions();
      fetchEarnings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit post');
    }
  };

  const handleUpdateViews = async (submissionId: string, newViews: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/views`, {
        views: newViews
      });
      fetchSubmissions();
      fetchEarnings();
    } catch (err: any) {
      console.error('Error updating views:', err);
      alert('Failed to update views');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {showSubmitForm ? 'Cancel' : 'Submit Post'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Total Earnings</h2>
          <p className="text-4xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
        </div>

        {showSubmitForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit Post to Campaign</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Campaign</label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Choose a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.name} ({campaign.platform}) - Budget: ₹{campaign.totalBudget}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Post Link</label>
                <input
                  type="url"
                  value={postLink}
                  onChange={(e) => setPostLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://instagram.com/p/..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit Post
              </button>
            </form>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No submissions yet. Submit your first post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((submission) => {
              const campaign = typeof submission.campaignId === 'object' 
                ? submission.campaignId 
                : campaigns.find(c => c._id === submission.campaignId);
              
              return (
                <div key={submission._id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-2">
                    {typeof campaign === 'object' ? campaign.name : 'Unknown Campaign'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Platform: {typeof campaign === 'object' ? campaign.platform : 'N/A'}
                  </p>
                  <a 
                    href={submission.postLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 mb-4 block"
                  >
                    {submission.postLink}
                  </a>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-semibold">{submission.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Current Payout:</span>
                      <span className="font-semibold text-green-600">₹{submission.payout}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Update views"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        min="0"
                        id={`views-${submission._id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`views-${submission._id}`) as HTMLInputElement;
                          handleUpdateViews(submission._id, parseInt(input.value));
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This simulates platform data updates
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Available Campaigns</h2>
        
        {campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No active campaigns available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
                <p className="text-gray-600 mb-2">Platform: {campaign.platform}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Remaining</span>
                    <span>₹{(campaign.totalBudget - campaign.spent).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${((campaign.totalBudget - campaign.spent) / campaign.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Milestones:</p>
                  {campaign.milestones.map((m, i) => (
                    <p key={i}>{m.views.toLocaleString()} views → ₹{m.payout}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
