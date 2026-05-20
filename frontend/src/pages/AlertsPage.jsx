import { Bell, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectInput, TextArea, TextInput } from '../components/FormControls';
import { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Pagination, Panel, StatusMessage, ToastStack } from '../components/Ui';
import useToasts from '../hooks/useToasts';
import { createAlert, deleteAlert, getAlerts, updateAlert } from '../services/securityService';

const initialForm = {
  titulo: '',
  descripcion: '',
  categoria: 'phishing',
  severidad: 'media',
  estadoAlerta: 'abierta',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function loadAlerts(nextPage = page) {
    setLoading(true);
    setError('');

    try {
      const data = await getAlerts({ busqueda: search, severidad: severity, page: nextPage, pageSize });
      setAlerts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las alertas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAlerts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateAlert(editingId, form);
      } else {
        await createAlert(form);
      }
      setForm(initialForm);
      setEditingId(null);
      setModalOpen(false);
      showToast({ title: editingId ? 'Alerta actualizada' : 'Alerta creada' });
      await loadAlerts();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la alerta');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(alert) {
    setEditingId(alert.idAlerta);
    setForm({
      titulo: alert.titulo || '',
      descripcion: alert.descripcion || '',
      categoria: alert.categoria || 'phishing',
      severidad: alert.severidad || 'media',
      estadoAlerta: alert.estadoAlerta || 'abierta',
    });
    setModalOpen(true);
  }

  async function handleDelete() {
    await deleteAlert(deleteTarget.idAlerta);
    setDeleteTarget(null);
    showToast({ title: 'Alerta eliminada' });
    await loadAlerts();
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader
        title="Alertas"
        description="Alertas de seguridad filtradas por la empresa del usuario autenticado."
        action={
          <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-3 py-2 text-sm font-black text-white shadow-sm hover:bg-[#003ea6]">
            <Plus size={16} />
            Nueva
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
            <Bell size={16} />
            {total} alertas
          </div>
          </div>
        }
      />

      <div>
      <Panel className="p-5">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar alerta"
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
            />
          </div>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
          >
            <option value="">Todas las severidades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <button
            type="button"
            onClick={() => { setPage(1); loadAlerts(1); }}
            className="rounded-lg bg-[#004ac6] px-4 py-3 text-sm font-bold text-white hover:bg-[#003ea6]"
          >
            Filtrar
          </button>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {loading ? (
          <LoadingBlock />
        ) : alerts.length === 0 ? (
          <EmptyState title="Sin alertas" description="No hay alertas para los filtros seleccionados." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((alert) => (
              <article key={alert.idAlerta} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="font-black text-slate-950">{alert.titulo}</h2>
                  <SeverityBadge value={alert.severidad} />
                </div>
                <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">{alert.descripcion || 'Sin descripción'}</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{alert.categoria || 'general'}</span>
                  <span>{alert.estadoAlerta || 'pendiente'}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => handleEdit(alert)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"><Pencil size={15} /></button>
                  <button type="button" onClick={() => setDeleteTarget(alert)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(next) => { setPage(next); loadAlerts(next); }} />
      </Panel>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar alerta' : 'Nueva alerta'} description="Registra señales de riesgo para la empresa.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextInput label="Título" value={form.titulo} onChange={(value) => setForm({ ...form, titulo: value })} />
          <TextArea label="Descripción" value={form.descripcion} onChange={(value) => setForm({ ...form, descripcion: value })} />
          <SelectInput label="Categoría" value={form.categoria} onChange={(value) => setForm({ ...form, categoria: value })} options={[{ value: 'phishing', label: 'Phishing' }, { value: 'accesos', label: 'Accesos' }, { value: 'vulnerabilidades', label: 'Vulnerabilidades' }]} />
          <SelectInput label="Severidad" value={form.severidad} onChange={(value) => setForm({ ...form, severidad: value })} options={[{ value: 'critica', label: 'Crítica' }, { value: 'alta', label: 'Alta' }, { value: 'media', label: 'Media' }, { value: 'baja', label: 'Baja' }]} />
          <SelectInput label="Estado" value={form.estadoAlerta} onChange={(value) => setForm({ ...form, estadoAlerta: value })} options={[{ value: 'abierta', label: 'Abierta' }, { value: 'en_revision', label: 'En revisión' }, { value: 'resuelta', label: 'Resuelta' }]} />
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60">
            <Plus size={16} />
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear alerta'}
          </button>
        </form>
      </Modal>
      </div>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Eliminar alerta" description={`Vas a eliminar "${deleteTarget?.titulo || 'esta alerta'}".`} confirmLabel="Eliminar" onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </>
  );
}

function SeverityBadge({ value }) {
  const styles = {
    critica: 'bg-red-100 text-red-700',
    alta: 'bg-orange-100 text-orange-700',
    media: 'bg-amber-100 text-amber-700',
    baja: 'bg-emerald-100 text-emerald-700',
  };

  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[value] || 'bg-slate-100 text-slate-600'}`}>{value || 'baja'}</span>;
}
