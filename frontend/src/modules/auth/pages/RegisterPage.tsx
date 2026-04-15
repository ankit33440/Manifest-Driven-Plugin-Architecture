import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import PasswordInput from '../components/PasswordInput';

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
  { label: 'One number (0–9)', test: (v) => /\d/.test(v) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const passing = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-1.5">
            {passing ? (
              <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-500" />
            ) : (
              <Circle size={13} className="flex-shrink-0 text-ink-faint" />
            )}
            <span className={`text-xs ${passing ? 'text-emerald-600' : 'text-ink-muted'}`}>
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    const failingRules = PASSWORD_RULES.filter((r) => !r.test(password));
    if (failingRules.length > 0) {
      errors.password = `Password must meet all requirements below`;
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ firstName, lastName, email, password, role: 'BUYER' });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch {
      setError('Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink">Create an account</h1>
          <p className="mt-1 text-sm text-ink-muted">Join Nature's Registry as a Buyer</p>
        </div>

        <div className="surface-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
                placeholder="Jane"
                error={fieldErrors.firstName}
              />
              <Input
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Smith"
                error={fieldErrors.lastName}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <div>
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                error={fieldErrors.password}
                autoHideDelay={2}
              />
              <PasswordStrength password={password} />
            </div>

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter your password"
              error={fieldErrors.confirmPassword}
              autoHideDelay={2}
            />

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
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted px-2">
          Verifier and Certifier accounts are provisioned by an administrator.
        </p>

        <p className="mt-3 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-ink hover:text-accent transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
