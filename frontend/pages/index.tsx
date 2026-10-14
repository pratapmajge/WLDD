import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meme'd
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 font-medium">Welcome, {user.name}</span>
                  <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                    {user.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="nav-link"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="btn-primary"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Campaign Payout Tracker
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Brands create campaigns, creators submit content, and payouts are tracked based on view milestones.
          </p>
          
          {user ? (
            <div className="space-y-4">
              {user.role === 'brand' && (
                <button
                  onClick={() => router.push('/brand/dashboard')}
                  className="btn-primary text-lg"
                >
                  Go to Brand Dashboard
                </button>
              )}
              {user.role === 'creator' && (
                <button
                  onClick={() => router.push('/creator/dashboard')}
                  className="btn-primary text-lg"
                >
                  Go to Creator Dashboard
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/signup')}
              className="btn-primary text-lg"
            >
              Get Started
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">For Brands</h3>
            <p className="text-gray-600">
              Create campaigns with milestone-based payouts. Track your budget and see how much you've spent.
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">For Creators</h3>
            <p className="text-gray-600">
              Browse live campaigns, submit your content, and track your earnings as your views grow.
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Fair Payouts</h3>
            <p className="text-gray-600">
              Payouts are calculated based on the highest milestone crossed. Budget is never exceeded.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
