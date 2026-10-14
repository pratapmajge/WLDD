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
  viewHistory?: {
    views: number;
    payout: number;
    timestamp: string;
  }[];
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSubmissionHistory, setSelectedSubmissionHistory] = useState<any[]>([]);
  const [selectedSubmissionName, setSelectedSubmissionName] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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

  const handleViewHistory = async (submissionId: string, campaignName: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/submissions/${submissionId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedSubmissionHistory(response.data);
      setSelectedSubmissionName(campaignName);
      setShowHistoryModal(true);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      alert('Failed to fetch view history');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="btn-primary"
          >
            {showSubmitForm ? 'Cancel' : 'Submit Post'}
          </button>
        </div>

        <div className="card mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h2 className="text-2xl font-bold mb-2">Total Earnings</h2>
          <p className="text-4xl font-bold">₹{totalEarnings.toLocaleString()}</p>
        </div>

        {showSubmitForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Submit Post to Campaign</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Campaign</label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="input-field"
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
                  className="input-field"
                  placeholder="https://instagram.com/p/..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
              >
                Submit Post
              </button>
            </form>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Submissions</h2>
        
        {submissions.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-500 text-lg">No submissions yet. Submit your first post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((submission) => {
              const campaign = typeof submission.campaignId === 'object' 
                ? submission.campaignId 
                : campaigns.find(c => c._id === submission.campaignId);
              
              return (
                <div key={submission._id} className="card">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {typeof campaign === 'object' ? campaign.name : 'Unknown Campaign'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Platform: {typeof campaign === 'object' ? campaign.platform : 'N/A'}
                  </p>
                  <a 
                    href={submission.postLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-purple-600 mb-4 block transition-colors"
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
                    
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        placeholder="Update views"
                        className="flex-1 input-field"
                        min="0"
                        id={`views-${submission._id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`views-${submission._id}`) as HTMLInputElement;
                          handleUpdateViews(submission._id, parseInt(input.value));
                        }}
                        className="btn-primary"
                      >
                        Update
                      </button>
                    </div>
                    <button
                      onClick={() => handleViewHistory(submission._id, typeof campaign === 'object' ? campaign.name : 'Unknown')}
                      className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      View History
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      This simulates platform data updates
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">View History - {selectedSubmissionName}</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {selectedSubmissionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No view history available</p>
              ) : (
                <div className="space-y-2">
                  {selectedSubmissionHistory.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{entry.views.toLocaleString()} views</p>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">₹{entry.payout}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Available Campaigns</h2>
        
        {campaigns.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-gray-500 text-lg">No active campaigns available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="card">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{campaign.name}</h3>
                <p className="text-gray-600 mb-2">Platform: {campaign.platform}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Budget Remaining</span>
                    <span className="font-medium">₹{(campaign.totalBudget - campaign.spent).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
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
