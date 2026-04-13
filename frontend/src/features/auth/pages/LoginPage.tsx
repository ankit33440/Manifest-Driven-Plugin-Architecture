import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../providers/AuthProvider';
import { getPostLoginRoute } from '../utils/getPostLoginRoute';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    try {
      const user = await login(values);
      const redirectTo =
        (location.state as { from?: string } | undefined)?.from ??
        getPostLoginRoute(user.roles);
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message ?? 'Unable to sign in with those credentials.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f5faf4_0%,#eef2f3_45%,#e7ecef_100%)] px-6 py-12">
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[36px] bg-[#20323d] p-12 text-white shadow-[0_28px_60px_rgba(15,23,42,0.24)] lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d8efc6]">
            Nature&apos;s Registry V2
          </p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.95] tracking-[-0.06em]">
            Carbon registry infrastructure for every participant in the lifecycle.
          </h1>
          <p className="mt-8 max-w-xl text-xl leading-relaxed text-white/75">
            Secure approvals, flexible invitations, dynamic RBAC, and a project workflow
            that mirrors the platform reference UI.
          </p>
        </div>

        <div className="surface p-8 sm:p-12">
          <p className="field-label">Access Workspace</p>
          <h2 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
            Sign in
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            Continue into Nature&apos;s Registry with your approved account.
          </p>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="field-label">Email</label>
              <input className="field mt-2" type="email" {...register('email', { required: true })} />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                className="field mt-2"
                type="password"
                {...register('password', { required: true })}
              />
            </div>

            <button className="primary-button h-14 w-full text-base" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm text-stone-500">
            <span>Project developer self-registration is available.</span>
            <button
              className="font-semibold text-emerald-700"
              onClick={() => navigate('/register')}
              type="button"
            >
              Register now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
