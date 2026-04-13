import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  registerDeveloper,
  registerInvited,
  validateInvitation,
} from '../../../api/auth';
import { setAccessToken } from '../../../api/tokenStore';
import { getPostLoginRoute } from '../utils/getPostLoginRoute';

interface RegisterFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [invitation, setInvitation] = useState<{ email: string; role: string } | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(Boolean(token));
  const [successMessage, setSuccessMessage] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
    setError,
  } = useForm<RegisterFormValues>();

  useEffect(() => {
    if (!token) {
      return;
    }

    void (async () => {
      try {
        const payload = await validateInvitation(token);
        setInvitation(payload);
        setValue('email', payload.email);
      } catch (error: any) {
        setError('root', {
          message: error.response?.data?.message ?? 'Invitation link is not valid.',
        });
      } finally {
        setLoadingInvitation(false);
      }
    })();
  }, [token, setError, setValue]);

  async function onSubmit(values: RegisterFormValues) {
    try {
      if (token) {
        const session = await registerInvited({ ...values, token });
        setAccessToken(session.accessToken);
        navigate(getPostLoginRoute(session.user.roles), { replace: true });
        return;
      }

      await registerDeveloper(values);
      setSuccessMessage('Registration submitted. An administrator will review your account.');
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message ?? 'Unable to complete registration.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2f3] px-6 py-12">
      <div className="surface w-full max-w-3xl p-8 sm:p-12">
        <p className="field-label">{token ? 'Invitation Registration' : 'Project Developer Registration'}</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
          {token ? 'Complete your invitation' : 'Create your account'}
        </h1>
        <p className="mt-4 text-lg text-stone-500">
          {token
            ? `You are joining as ${invitation?.role ?? 'a platform user'}.`
            : 'New self-registered accounts are created as project developers and require approval.'}
        </p>

        {loadingInvitation ? (
          <div className="mt-10 text-stone-500">Validating invitation...</div>
        ) : (
          <form className="mt-10 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="field-label">First Name</label>
              <input className="field mt-2" {...register('firstName', { required: true })} />
            </div>
            <div>
              <label className="field-label">Last Name</label>
              <input className="field mt-2" {...register('lastName', { required: true })} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Email</label>
              <input
                className="field mt-2"
                type="email"
                readOnly={Boolean(token)}
                {...register('email', { required: true })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Password</label>
              <input
                className="field mt-2"
                type="password"
                {...register('password', { required: true })}
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-4 pt-2">
              <button className="primary-button h-14 flex-1 text-base" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Submitting...' : token ? 'Complete registration' : 'Submit for approval'}
              </button>
              <button className="secondary-button h-14" onClick={() => navigate('/login')} type="button">
                Back to login
              </button>
            </div>

            {successMessage ? (
              <div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                {successMessage}
              </div>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
