import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectInput, TextInput } from '../components/FormControls';
import { LoadingBlock, PageHeader, Panel, StatusMessage } from '../components/Ui';
import { getProfile, getSecurity, getSessions, getSubscription, updateProfile, updateSecurity } from '../services/settingsService';

export default function SettingsPage() {
  const [profile, setProfile] = useState({ nombreCompleto: '', cargo: '', idiomaInterfaz: 'es' });
  const [security, setSecurity] = useState({ twoFactorEnabled: false, metodo2fa: 'authenticator' });
  const [sessions, setSessions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [profileData, securityData, sessionsData, subscriptionData] = await Promise.all([
        getProfile(),
        getSecurity(),
        getSessions().catch(() => []),
        getSubscription().catch(() => null),
      ]);
      setProfile(profileData);
      setSecurity(securityData);
      setSessions(sessionsData);
      setSubscription(subscriptionData);
    } catch (err) {
      setError(err.message || 'No se pudo cargar configuración');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setProfile(await updateProfile(profile));
    setMessage('Perfil actualizado.');
  }

  async function saveSecurity(event) {
    event.preventDefault();
    setSecurity(await updateSecurity(security));
    setMessage('Seguridad actualizada.');
  }

  return (
    <>
      <PageHeader title="Configuración" description="Perfil, seguridad, sesiones y suscripción conectados al backend." />
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {message && <div className="mb-4"><StatusMessage type="success">{message}</StatusMessage></div>}
      {loading ? <LoadingBlock /> : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel className="p-5">
            <h2 className="mb-5 text-lg font-black text-slate-950">Perfil</h2>
            <form className="space-y-4" onSubmit={saveProfile}>
              <TextInput label="Nombre completo" value={profile.nombreCompleto || ''} onChange={(value) => setProfile({ ...profile, nombreCompleto: value })} />
              <TextInput label="Cargo" required={false} value={profile.cargo || ''} onChange={(value) => setProfile({ ...profile, cargo: value })} />
              <SelectInput label="Idioma" value={profile.idiomaInterfaz || 'es'} onChange={(value) => setProfile({ ...profile, idiomaInterfaz: value })} options={[{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }]} />
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white"><Save size={16} /> Guardar perfil</button>
            </form>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-5 text-lg font-black text-slate-950">Seguridad</h2>
            <form className="space-y-4" onSubmit={saveSecurity}>
              <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <span className="font-bold text-slate-800">Autenticación en dos pasos</span>
                <input type="checkbox" checked={Boolean(security.twoFactorEnabled)} onChange={(event) => setSecurity({ ...security, twoFactorEnabled: event.target.checked })} />
              </label>
              <SelectInput label="Método 2FA" value={security.metodo2fa || 'authenticator'} onChange={(value) => setSecurity({ ...security, metodo2fa: value })} options={[{ value: 'authenticator', label: 'Authenticator' }, { value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }]} />
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white"><Save size={16} /> Guardar seguridad</button>
            </form>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-5 text-lg font-black text-slate-950">Sesiones</h2>
            {sessions.map((session) => (
              <div key={session.idSesion} className="mb-3 rounded-lg border border-slate-200 p-4">
                <p className="font-bold text-slate-950">{session.dispositivo || 'Dispositivo'}</p>
                <p className="text-sm text-slate-500">{session.ip || 'IP no registrada'} · {session.activa ? 'Activa' : 'Cerrada'}</p>
              </div>
            ))}
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-5 text-lg font-black text-slate-950">Suscripción</h2>
            <p className="text-3xl font-black text-slate-950">{subscription?.nombrePlan || 'Plan activo'}</p>
            <p className="mt-2 text-sm text-slate-500">Estado: {subscription?.estado || 'activa'}</p>
            <p className="mt-1 text-sm text-slate-500">Próxima facturación: {subscription?.proximaFacturacion || '-'}</p>
          </Panel>
        </div>
      )}
    </>
  );
}
