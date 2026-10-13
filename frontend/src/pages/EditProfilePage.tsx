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
import { compact, emailKey, requiredKey, userNameKey, type FieldErrors } from '../utils/validation';

/** `/account/profile`: the signed-in user edits their name, username and email. */
export default function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ fullName: user?.fullName ?? '', userName: user?.userName ?? '', email: user?.email ?? '' });
  const [submitted, setSubmitted] = useState(false);
  const [taken, setTaken] = useState<'userName' | 'email' | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = useDirty(form);

  const validate = (): FieldErrors<keyof typeof form> => compact({
    fullName: requiredKey(form.fullName),
    userName: userNameKey(form.userName) ?? (taken === 'userName' ? 'auth.userNameTaken' : undefined),
    email: emailKey(form.email) ?? (taken === 'email' ? 'auth.emailExists' : undefined),
  });
  const errors = submitted ? validate() : {};
  const fieldError = (key: keyof typeof form) => errors[key] && t(errors[key]!);
  const update = (patch: Partial<typeof form>) => { setForm({ ...form, ...patch }); setTaken(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(validate()).length) return;
    setSaving(true);
    try {
      const result = await authService.updateProfile({ fullName: form.fullName.trim(), userName: form.userName.trim(), email: form.email.trim() });
      if (result.data) setUser({ userName: result.data.userName, email: result.data.email, fullName: result.data.fullName, token: result.data.token });
      showToast(t('account.profileSaved'), 'success');
      navigate('/profile');
    } catch (err) {
      const message = getApiErrorMessage(err, '');
      // 409: the server says whether the username or the email is the one in use
      if (getErrorStatus(err) === 409) setTaken(/username/i.test(message) ? 'userName' : 'email');
      else showToast(message || t('auth.serverError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader icon="profile" parent={{ label: t('profile.title'), to: '/profile' }} title={t('account.editProfile')} />
      <form onSubmit={handleSubmit} noValidate>
        <fieldset disabled={saving} className="min-w-0">
          <FormSection title={t('profile.userInfo')}>
            <FormField label={t('auth.fullName')} required error={fieldError('fullName')} className="md:col-span-2">
              {(id) => <input id={id} type="text" autoComplete="name" value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} />}
            </FormField>
            <FormField label={t('auth.userName')} required error={fieldError('userName')}>
              {(id) => <input id={id} type="text" dir="ltr" autoComplete="username" autoCapitalize="none" spellCheck={false} value={form.userName} onChange={(e) => update({ userName: e.target.value })} />}
            </FormField>
            <FormField label={t('auth.email')} required error={fieldError('email')}>
              {(id) => <input id={id} type="email" dir="ltr" autoComplete="email" value={form.email} onChange={(e) => update({ email: e.target.value })} />}
            </FormField>
          </FormSection>
        </fieldset>
        <FormPageActions onCancel={() => navigate('/profile')} submitLabel={t('common.saveChanges')} saving={saving} dirty={dirty} />
      </form>
    </MainLayout>
  );
}
