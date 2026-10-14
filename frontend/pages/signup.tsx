import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'brand' | 'creator'>('creator');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        name,
        email,
        password,
        role
      });

      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.role === 'brand') {
        router.push('/brand/dashboard');
      } else {
        router.push('/creator/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full card">
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-6">Join Meme'd today</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'brand' | 'creator')}
              className="input-field"
            >
              <option value="creator">Creator</option>
              <option value="brand">Brand</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:text-purple-600 font-medium transition-colors"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
