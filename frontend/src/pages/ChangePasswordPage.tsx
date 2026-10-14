import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { getApiErrorMessage, getErrorStatus } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { FormField } from '../components/ui/FormField';
import { FormPageActions, FormSection } from '../components/ui/FormPage';
import { useToast } from '../components/ui/useToast';
import { useDirty } from '../hooks/useDirty';
import { compact, requiredKey, type FieldErrors } from '../utils/validation';

const empty = { currentPassword: '', newPassword: '', confirmNewPassword: '' };

/** `/account/password`: the signed-in user changes their own password; the current one is required. */
export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [currentWrong, setCurrentWrong] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = useDirty(form);

  // Mirrors the server's password policy: at least 6 characters including a digit
  const validate = (wrong = currentWrong): FieldErrors<keyof typeof empty> => compact({
    currentPassword: requiredKey(form.currentPassword) ?? (wrong ? 'account.currentWrong' : undefined),
    newPassword: requiredKey(form.newPassword)
      ?? (form.newPassword.length >= 6 && /\d/.test(form.newPassword) ? undefined : 'validation.passwordRules')
      ?? (form.newPassword === form.currentPassword ? 'account.sameAsCurrent' : undefined),
    confirmNewPassword: requiredKey(form.confirmNewPassword)
      ?? (form.confirmNewPassword === form.newPassword ? undefined : 'auth.passwordMismatch'),
  });
  const errors = submitted || currentWrong ? validate() : {};
  const fieldError = (key: keyof typeof empty) => errors[key] && t(errors[key]!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setCurrentWrong(false);
    if (Object.keys(validate(false)).length) return;
    setSaving(true);
    try {
      const result = await authService.changePassword(form);
      if (result.data) setUser({ userName: result.data.userName, email: result.data.email, fullName: result.data.fullName, token: result.data.token });
      setForm(empty);
      showToast(t('account.changed'), 'success');
      navigate('/dashboard');
    } catch (err) {
      const message = getApiErrorMessage(err, '');
      if (getErrorStatus(err) === 400 && /current password/i.test(message)) setCurrentWrong(true);
      else showToast(message || t('auth.serverError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const placeholders = { currentPassword: 'account.phCurrentPassword', newPassword: 'account.phNewPassword', confirmNewPassword: 'account.phConfirmPassword' } as const;
  const passwordInput = (key: keyof typeof empty, autoComplete: string) => (id: string) => (
    <input id={id} type="password" autoComplete={autoComplete} placeholder={t(placeholders[key])} value={form[key]}
      onChange={(e) => { setForm({ ...form, [key]: e.target.value }); if (key === 'currentPassword') setCurrentWrong(false); }} />
  );

  return (
    <MainLayout>
      <PageHeader icon="profile" parent={{ label: t('profile.title'), to: '/profile' }} title={t('account.changePassword')} />
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={saving} className="min-w-0">
          <div className="space-y-4">
            <p className="text-sm text-muted">{t('account.changePasswordHint')}</p>
            <FormSection title={t('account.passwordSection')}>
              <FormField label={t('account.currentPassword')} required error={fieldError('currentPassword')} className="md:col-span-2">
                {passwordInput('currentPassword', 'current-password')}
              </FormField>
              <FormField label={t('account.newPassword')} required error={fieldError('newPassword')}>
                {passwordInput('newPassword', 'new-password')}
              </FormField>
              <FormField label={t('account.confirmNewPassword')} required error={fieldError('confirmNewPassword')}>
                {passwordInput('confirmNewPassword', 'new-password')}
              </FormField>
              {!fieldError('newPassword') && <p className="-mt-2 text-xs text-muted md:col-span-2">{t('account.passwordRule')}</p>}
            </FormSection>
          </div>
        </fieldset>
        <FormPageActions backLabel={t('account.backToProfile')} onCancel={() => navigate('/profile')} submitLabel={t('account.changePassword')} submitIcon="key" saving={saving} dirty={dirty} />
      </form>
    </MainLayout>
  );
}
