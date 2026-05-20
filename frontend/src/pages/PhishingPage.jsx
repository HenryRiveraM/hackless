import { Eye, MailWarning, Play, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectInput, TextArea, TextInput } from '../components/FormControls';
import { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Panel, StatusMessage, ToastStack } from '../components/Ui';
import useToasts from '../hooks/useToasts';
import { createCampaign, deleteCampaign, getCampaigns, getTemplates, simulateCampaign } from '../services/phishingService';

export default function PhishingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', asuntoEmail: '', idPlantilla: '', empleados: '' });
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [campaignsData, templatesData] = await Promise.all([getCampaigns(), getTemplates()]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
      if (!form.idPlantilla && templatesData[0]) setForm((current) => ({ ...current, idPlantilla: String(templatesData[0].idPlantilla || templatesData[0].id_plantilla) }));
    } catch (err) {
      setError(err.message || 'No se pudo cargar phishing');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const empleados = form.empleados.split(',').map((item) => Number(item.trim())).filter(Boolean);
      await createCampaign({ ...form, idPlantilla: Number(form.idPlantilla), empleados });
      setForm({ nombre: '', descripcion: '', asuntoEmail: '', idPlantilla: form.idPlantilla, empleados: '' });
      showToast({ title: 'Campaña creada' });
      await load();
    } catch (err) {
      setError(err.message || 'No se pudo crear la campaña');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader title="Phishing" description="Campañas, plantillas y simulaciones de phishing conectadas al backend." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Panel className="p-5">
          {error && <StatusMessage type="error">{error}</StatusMessage>}
          {loading ? <LoadingBlock /> : campaigns.length === 0 ? <EmptyState title="Sin campañas" description="Crea una campaña para asignar empleados y simular eventos." /> : (
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <article key={campaign.idCampana || campaign.id_campana} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-black text-slate-950">{campaign.nombre}</h2>
                      <p className="text-sm text-slate-500">{campaign.estadoCampana || campaign.estado_campana || 'borrador'}</p>
                    </div>
                    <MailWarning className="text-[#004ac6]" size={20} />
                  </div>
                  <p className="mb-4 text-sm leading-6 text-slate-600">{campaign.descripcion || 'Sin descripción'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => setDetail(campaign)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50" type="button">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => simulateCampaign(campaign.idCampana || campaign.id_campana).then(() => { showToast({ title: 'Simulación ejecutada' }); load(); })} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white" type="button">
                      <Play size={14} />
                      Simular
                    </button>
                    <button onClick={() => setDeleteTarget(campaign)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
        <Panel className="p-5">
          <h2 className="mb-5 text-lg font-black text-slate-950">Nueva campaña</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextInput label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} />
            <TextInput label="Asunto email" value={form.asuntoEmail} onChange={(value) => setForm({ ...form, asuntoEmail: value })} />
            <SelectInput
              label="Plantilla"
              value={form.idPlantilla}
              onChange={(value) => setForm({ ...form, idPlantilla: value })}
              options={templates.length ? templates.map((template) => ({ value: String(template.idPlantilla || template.id_plantilla), label: template.nombre })) : [{ value: '', label: 'Sin plantillas' }]}
            />
            <TextInput label="IDs empleados" required={false} placeholder="1,2,3" value={form.empleados} onChange={(value) => setForm({ ...form, empleados: value })} />
            <TextArea label="Descripción" value={form.descripcion} onChange={(value) => setForm({ ...form, descripcion: value })} />
            <button disabled={saving} className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60">
              {saving ? 'Creando...' : 'Crear campaña'}
            </button>
          </form>
        </Panel>
      </div>
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.nombre || 'Campaña'} description={detail?.estadoCampana || detail?.estado_campana || 'Campaña phishing'}>
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p>{detail?.descripcion || 'Sin descripción'}</p>
          <p><strong className="text-slate-900">Asunto:</strong> {detail?.asuntoEmail || detail?.asunto_email || '-'}</p>
          <p><strong className="text-slate-900">Inicio:</strong> {detail?.fechaInicio || detail?.fecha_inicio || '-'}</p>
          <p><strong className="text-slate-900">Fin:</strong> {detail?.fechaFin || detail?.fecha_fin || '-'}</p>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar campaña"
        description={`Vas a eliminar "${deleteTarget?.nombre || 'esta campaña'}".`}
        confirmLabel="Eliminar"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteCampaign(deleteTarget.idCampana || deleteTarget.id_campana).then(() => { setDeleteTarget(null); showToast({ title: 'Campaña eliminada' }); load(); })}
      />
    </>
  );
}
