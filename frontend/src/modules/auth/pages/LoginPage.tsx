import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  color: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'SUPERADMIN', email: 'admin@natures.io', password: 'admin123', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' },
  { role: 'PROJECT_DEVELOPER', email: 'dev@natures.io', password: 'dev123', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
  { role: 'VERIFIER', email: 'verifier@natures.io', password: 'verify123', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
  { role: 'CERTIFIER', email: 'certifier@natures.io', password: 'cert123', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
  { role: 'BUYER', email: 'buyer@natures.io', password: 'buyer123', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(cred: DemoCredential) {
    setError('');
    setLoading(true);
    try {
      await login(cred.email, cred.password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Demo login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold text-gray-900">Nature's Registry</h1>
          <p className="text-gray-500 mt-1">Carbon Credit Platform</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400">Quick demo login</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => handleDemoLogin(cred)}
                  disabled={loading}
                  className={`flex items-center justify-between px-3 py-2 border rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${cred.color}`}
                >
                  <span className="font-semibold">{cred.role.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400 font-normal">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
