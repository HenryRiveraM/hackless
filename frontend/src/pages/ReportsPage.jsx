import { Eye, FilePlus2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TextArea, TextInput } from '../components/FormControls';
import { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Panel, StatusMessage, ToastStack } from '../components/Ui';
import useToasts from '../hooks/useToasts';
import { getUser, refreshCurrentUser } from '../services/authService';
import { createReport, deleteReport, getReports } from '../services/reportsService';

const initialForm = {
  periodo: 'Q1 2026',
  puntajeGlobal: 80,
  resilienciaPhishing: 75,
  capacitacionCompletada: 60,
  vulnerabilidadesCriticas: 0,
  resumenEjecutivo: '',
};

export default function ReportsPage() {
  const [user, setUser] = useState(getUser());
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function currentUser() {
    if (user?.id_empresa) return user;
    const fresh = await refreshCurrentUser();
    setUser(fresh);
    return fresh;
  }

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const activeUser = await currentUser();
      const data = await getReports({ idEmpresa: activeUser.id_empresa, pageSize: 20 });
      setReports(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(loadReports, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const activeUser = await currentUser();
      await createReport({
        ...form,
        idEmpresa: activeUser.id_empresa,
        puntajeGlobal: Number(form.puntajeGlobal),
        resilienciaPhishing: Number(form.resilienciaPhishing),
        capacitacionCompletada: Number(form.capacitacionCompletada),
        vulnerabilidadesCriticas: Number(form.vulnerabilidadesCriticas),
      });
      setForm(initialForm);
      setModalOpen(false);
      setSuccess('Reporte creado correctamente.');
      showToast({ title: 'Reporte creado' });
      await loadReports();
    } catch (err) {
      setError(err.message || 'No se pudo crear el reporte');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await deleteReport(deleteTarget.idReporte);
    setDeleteTarget(null);
    showToast({ title: 'Reporte eliminado' });
    await loadReports();
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader title="Reportes" description="Reportes ejecutivos conectados a métricas de seguridad y cumplimiento." action={
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-3 py-2 text-sm font-black text-white">
          <Plus size={16} />
          Nuevo reporte
        </button>
      } />
      <div>
        <Panel className="p-5">
          {error && <StatusMessage type="error">{error}</StatusMessage>}
          {success && <div className="mb-4"><StatusMessage type="success">{success}</StatusMessage></div>}
          {loading ? (
            <LoadingBlock />
          ) : reports.length === 0 ? (
            <EmptyState title="Sin reportes" description="Genera un reporte para documentar el estado de seguridad." />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <article key={report.idReporte} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-black text-slate-950">{report.periodo}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{report.resumenEjecutivo}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setDetail(report)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"><Eye size={16} /></button>
                      <button type="button" onClick={() => setDeleteTarget(report)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <Score label="Global" value={report.puntajeGlobal} />
                    <Score label="Phishing" value={report.resilienciaPhishing} />
                    <Score label="Capacitación" value={report.capacitacionCompletada} />
                    <Score label="Críticas" value={report.vulnerabilidadesCriticas} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo reporte" description={`${total} reportes registrados`}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextInput label="Periodo" value={form.periodo} onChange={(value) => setForm({ ...form, periodo: value })} />
            <TextInput label="Puntaje global" type="number" min="0" max="100" value={form.puntajeGlobal} onChange={(value) => setForm({ ...form, puntajeGlobal: value })} />
            <TextInput label="Resiliencia phishing" type="number" min="0" max="100" value={form.resilienciaPhishing} onChange={(value) => setForm({ ...form, resilienciaPhishing: value })} />
            <TextInput label="Capacitación completada" type="number" min="0" max="100" value={form.capacitacionCompletada} onChange={(value) => setForm({ ...form, capacitacionCompletada: value })} />
            <TextInput label="Vulnerabilidades críticas" type="number" min="0" value={form.vulnerabilidadesCriticas} onChange={(value) => setForm({ ...form, vulnerabilidadesCriticas: value })} />
            <TextArea label="Resumen ejecutivo" value={form.resumenEjecutivo} onChange={(value) => setForm({ ...form, resumenEjecutivo: value })} />
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60">
              <FilePlus2 size={16} />
              {saving ? 'Creando...' : 'Crear reporte'}
            </button>
          </form>
        </Modal>
      </div>
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={`Reporte ${detail?.periodo || ''}`} description="Detalle ejecutivo">
        {detail && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">{detail.resumenEjecutivo}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Score label="Puntaje global" value={detail.puntajeGlobal} />
              <Score label="Resiliencia phishing" value={detail.resilienciaPhishing} />
              <Score label="Capacitación completada" value={detail.capacitacionCompletada} />
              <Score label="Vulnerabilidades críticas" value={detail.vulnerabilidadesCriticas} />
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Eliminar reporte" description={`Vas a eliminar el reporte ${deleteTarget?.periodo || ''}.`} confirmLabel="Eliminar" onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </>
  );
}

function Score({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="text-xl font-black text-slate-950">{value ?? 0}</p>
    </div>
  );
}
