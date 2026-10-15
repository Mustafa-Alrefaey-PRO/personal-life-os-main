import { useTranslation } from 'react-i18next';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { BrandPicker } from '../components/ui/BrandPicker';
import { useNavigate } from 'react-router-dom';
import { LanguageMenu } from '../components/ui/LanguageMenu';
import { useAuthStore } from '../stores/authStore';
import { ThemeSwitch } from '../components/ui/ThemeSwitch';
import { useRamadanStore } from '../stores/ramadanStore';

function SettingRow({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-heading">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {control}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { enabled: ramadanEnabled, setEnabled: setRamadan } = useRamadanStore();


  return (
    <MainLayout>
      <PageHeader icon="profile"
        title={t('profile.title')} />


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={t('profile.userInfo')} padded={false}>
          <div className="flex items-center gap-4 border-b border-line px-5 py-5">
            <span className="flex size-14 items-center justify-center rounded-full border border-line bg-band text-xl font-bold text-primary">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
            <div>
              <p className="text-base font-bold text-heading">{user?.fullName}</p>
              <p className="text-sm text-muted"><bdi>{user?.email}</bdi></p>
            </div>
          </div>
          <dl className="divide-y divide-line">
            {[
              [t('profile.fullName'), user?.fullName],
              [t('profile.userName'), user?.userName ? `@${user.userName}` : undefined],
              [t('profile.email'), user?.email],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 px-5 py-3">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-sm font-semibold text-heading"><bdi>{value || t('common.na')}</bdi></dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap justify-end gap-3 border-t border-line px-5 py-4">
            <Button variant="secondary" icon="key" onClick={() => navigate('/account/password')}>{t('account.changePassword')}</Button>
            <Button icon="edit" onClick={() => navigate('/account/profile')}>{t('account.editProfile')}</Button>
          </div>
        </Card>

        <Card title={t('profile.preferences')} padded={false}>
          <div className="divide-y divide-line">
            <SettingRow title={t('profile.darkMode')} description={t('profile.darkModeDesc')}
              control={<ThemeSwitch />} />
            <SettingRow title={t('profile.ramadanMode')} description={t('profile.ramadanModeDesc')}
              control={<Toggle checked={ramadanEnabled} onChange={setRamadan} label={t('profile.ramadanMode')} />} />
            <SettingRow title={t('profile.language')} description={t('profile.languageDesc')}
              control={<LanguageMenu />} />
          </div>
        </Card>

        <Card title={t('profile.appearance')} className="lg:col-span-2">
          <p className="mb-1 text-sm font-semibold text-title">{t('profile.brandColor')}</p>
          <p className="mb-4 text-xs text-muted">{t('profile.brandColorDesc')}</p>
          <BrandPicker />
        </Card>
      </div>
    </MainLayout>
  );
}
