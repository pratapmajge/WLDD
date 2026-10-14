import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Meme'd</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <span className="text-sm text-gray-500 capitalize">({user.role})</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Campaign Payout Tracker
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Brands create campaigns, creators submit content, and payouts are tracked based on view milestones.
          </p>
          
          {user ? (
            <div className="space-y-4">
              {user.role === 'brand' && (
                <button
                  onClick={() => router.push('/brand/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
                >
                  Go to Brand Dashboard
                </button>
              )}
              {user.role === 'creator' && (
                <button
                  onClick={() => router.push('/creator/dashboard')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
                >
                  Go to Creator Dashboard
                </button>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => router.push('/signup')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">For Brands</h3>
            <p className="text-gray-600">
              Create campaigns with milestone-based payouts. Track your budget and see how much you've spent.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">For Creators</h3>
            <p className="text-gray-600">
              Browse live campaigns, submit your content, and track your earnings as your views grow.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">Fair Payouts</h3>
            <p className="text-gray-600">
              Payouts are calculated based on the highest milestone crossed. Budget is never exceeded.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
