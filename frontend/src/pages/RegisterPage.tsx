import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getApiErrorMessage, getErrorStatus } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthField } from '../components/ui/AuthField';
import { FormError } from '../components/ui/FormError';
import { compact, emailKey, requiredKey, userNameKey, type FieldErrors } from '../utils/validation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ userName: '', email: '', password: '', confirmPassword: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<keyof typeof form>>({});

  const update = (patch: Partial<typeof form>) => {
    setForm({ ...form, ...patch });
    setFieldErrors((errs) => { const next = { ...errs }; for (const k of Object.keys(patch)) delete next[k as keyof typeof next]; return next; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Mirrors the server's password policy: at least 6 characters including a digit
    const passwordKey = requiredKey(form.password) ?? (form.password.length >= 6 && /\d/.test(form.password) ? undefined : 'validation.passwordRules');
    const errs = compact({
      fullName: requiredKey(form.fullName),
      userName: userNameKey(form.userName),
      email: emailKey(form.email),
      password: passwordKey,
      confirmPassword: requiredKey(form.confirmPassword) ?? (form.confirmPassword === form.password ? undefined : 'auth.passwordMismatch'),
    });
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const result = await authService.register({ ...form, userName: form.userName.trim() });
      if (result.success && result.data) {
        setUser({ userName: result.data.userName, email: result.data.email, fullName: result.data.fullName, token: result.data.token });
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message || t('auth.registerFailed'));
      }
    } catch (err) {
      const status = getErrorStatus(err);
      // 409: the username or the email is already in use; the server says which
      if (status === 409) setError(getApiErrorMessage(err, '').toLowerCase().includes('username') ? t('auth.userNameTaken') : t('auth.emailExists'));
      // 400 carries the server's reason, e.g. a password rule from ASP.NET Identity
      else if (status === 400) setError(getApiErrorMessage(err, t('auth.registerFailed')));
      else setError(t('auth.serverError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('auth.register')}
      subtitle={t('auth.registerSubtitle')}
      footer={<>
        {t('auth.hasAccount')}{' '}
        <Link to="/login" replace className="font-semibold text-primary hover:underline">
          {t('auth.loginLink')}
        </Link>
      </>}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField label={t('auth.fullName')} type="text" icon="profile" value={form.fullName} autoComplete="name"
          onChange={(fullName) => update({ fullName })} placeholder={t('auth.fullNamePlaceholder')}
          error={fieldErrors.fullName && t(fieldErrors.fullName)} />
        <AuthField label={t('auth.userName')} type="text" icon="at" value={form.userName} autoComplete="username"
          onChange={(userName) => update({ userName })} placeholder={t('auth.userNamePlaceholder')}
          error={fieldErrors.userName && t(fieldErrors.userName)} />
        <AuthField label={t('auth.email')} type="email" icon="mail" value={form.email} autoComplete="email"
          onChange={(email) => update({ email })} placeholder={t('auth.emailPlaceholder')}
          error={fieldErrors.email && t(fieldErrors.email)} />
        <AuthField label={t('auth.password')} type="password" icon="lock" value={form.password} autoComplete="new-password"
          onChange={(password) => update({ password })} placeholder={t('auth.newPasswordPlaceholder')}
          error={fieldErrors.password && t(fieldErrors.password)} />
        <AuthField label={t('auth.confirmPassword')} type="password" icon="lock" value={form.confirmPassword} autoComplete="new-password"
          onChange={(confirmPassword) => update({ confirmPassword })} placeholder={t('auth.confirmPasswordPlaceholder')}
          error={fieldErrors.confirmPassword && t(fieldErrors.confirmPassword)} />

        <FormError message={error} />

        <Button type="submit" loading={loading} className="h-10 w-full">
          {loading ? t('auth.creatingAccount') : t('auth.register')}
        </Button>
      </form>
    </AuthLayout>
  );
}
