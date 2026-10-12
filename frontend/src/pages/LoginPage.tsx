import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getErrorStatus } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthField } from '../components/ui/AuthField';
import { FormError } from '../components/ui/FormError';
import { compact, emailKey, requiredKey, type FieldErrors } from '../utils/validation';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'email' | 'password'>>({});

  const update = (patch: Partial<typeof form>) => {
    setForm({ ...form, ...patch });
    // Editing a field clears its error
    setFieldErrors((errs) => { const next = { ...errs }; for (const k of Object.keys(patch)) delete next[k as keyof typeof next]; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = compact({ email: emailKey(form.email), password: requiredKey(form.password) });
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const result = await authService.login(form);
      if (result.success && result.data) {
        setUser({ email: result.data.email, fullName: result.data.fullName, token: result.data.token });
        // replace: Back from the dashboard must not return to the login form
        navigate('/dashboard', { replace: true });
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      const status = getErrorStatus(err);
      if (status === 401 || status === 400) setError(t('auth.invalidCredentials'));
      else if (status === 423) setError(t('auth.lockedOut'));
      else setError(t('auth.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.login')}
      subtitle={t('auth.loginSubtitle')}
      footer={<>
        {t('auth.noAccount')}{' '}
        <Link to="/register" replace className="font-semibold text-primary hover:underline">
          {t('auth.registerLink')}
        </Link>
      </>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField label={t('auth.email')} type="email" icon="mail" value={form.email} autoComplete="email"
          onChange={(email) => update({ email })} placeholder="you@example.com"
          error={fieldErrors.email && t(fieldErrors.email)} />
        <AuthField label={t('auth.password')} type="password" icon="lock" value={form.password} autoComplete="current-password"
          onChange={(password) => update({ password })} placeholder="••••••••"
          error={fieldErrors.password && t(fieldErrors.password)} />

        <FormError message={error} />

        <Button type="submit" loading={loading} className="h-10 w-full">
          {loading ? t('auth.signingIn') : t('auth.login')}
        </Button>
      </form>
    </AuthLayout>
  );
}
