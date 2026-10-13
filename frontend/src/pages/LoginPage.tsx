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
import { compact, requiredKey, type FieldErrors } from '../utils/validation';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'login' | 'password'>>({});

  const update = (patch: Partial<typeof form>) => {
    setForm({ ...form, ...patch });
    // Editing a field clears its error
    setFieldErrors((errs) => { const next = { ...errs }; for (const k of Object.keys(patch)) delete next[k as keyof typeof next]; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = compact({ login: requiredKey(form.login), password: requiredKey(form.password) });
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const result = await authService.login({ ...form, login: form.login.trim() });
      if (result.success && result.data) {
        setUser({ userName: result.data.userName, email: result.data.email, fullName: result.data.fullName, token: result.data.token });
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
        <AuthField label={t('auth.userNameOrEmail')} type="text" icon="profile" value={form.login} autoComplete="username"
          onChange={(login) => update({ login })} placeholder={t('auth.userNamePlaceholder')}
          error={fieldErrors.login && t(fieldErrors.login)} />
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
