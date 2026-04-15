import React, { FormEvent, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PasswordInput from '../components/PasswordInput';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = (location.state as { registered?: boolean } | null)?.registered === true;
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
    } catch (submitError: any) {
      setError(
        submitError?.response?.data?.message ||
          'Invalid email or password. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Sign in to your account to continue</p>
        </div>

        {justRegistered && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
            <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-500" />
            Account created! Sign in to get started.
          </div>
        )}

        <div className="surface-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
            />

            <div className="space-y-1">
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoHideDelay={2}
              />
              <div className="flex justify-end">
                <span className="text-xs text-ink-muted hover:text-ink cursor-pointer transition-colors">
                  Forgot password?
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-alert/20 bg-alert/5 px-3.5 py-2.5 text-sm text-alert">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-ink hover:text-accent transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
