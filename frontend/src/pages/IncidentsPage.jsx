import { AlertTriangle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectInput, TextArea, TextInput } from '../components/FormControls';
import { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Pagination, Panel, StatusMessage, ToastStack } from '../components/Ui';
import useToasts from '../hooks/useToasts';
import { createIncident, deleteIncident, getIncidents, updateIncident } from '../services/securityService';

const initialForm = {
  codigoIncidencia: '',
  titulo: '',
  severidad: 'medio',
  estadoIncidencia: 'abierta',
  resumenEvento: '',
  ipOrigen: '',
  dispositivoNavegador: '',
  recomendacion: '',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function loadIncidents(nextPage = page) {
    setLoading(true);
    setError('');

    try {
      const data = await getIncidents({ busqueda: search, estadoIncidencia: status, page: nextPage, pageSize });
      setIncidents(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las incidencias');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadIncidents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, marcaTiempo: new Date().toISOString() };
      if (editingId) {
        await updateIncident(editingId, payload);
      } else {
        await createIncident(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      setModalOpen(false);
      showToast({ title: editingId ? 'Incidencia actualizada' : 'Incidencia creada' });
      await loadIncidents();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la incidencia');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(incident) {
    setEditingId(incident.idIncidencia);
    setForm({
      codigoIncidencia: incident.codigoIncidencia || '',
      titulo: incident.titulo || '',
      severidad: incident.severidad || 'medio',
      estadoIncidencia: incident.estadoIncidencia || 'abierta',
      resumenEvento: incident.resumenEvento || '',
      ipOrigen: incident.ipOrigen || '',
      dispositivoNavegador: '',
      recomendacion: '',
    });
    setModalOpen(true);
  }

  async function handleDelete() {
    await deleteIncident(deleteTarget.idIncidencia);
    setDeleteTarget(null);
    showToast({ title: 'Incidencia eliminada' });
    await loadIncidents();
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader
        title="Incidencias"
        description="Seguimiento conectado al módulo de incidencias del backend."
        action={
          <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-3 py-2 text-sm font-black text-white shadow-sm hover:bg-[#003ea6]">
            <Plus size={16} />
            Nueva
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
            <AlertTriangle size={16} />
            {total} incidencias
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
              placeholder="Buscar incidencia"
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
          >
            <option value="">Todos los estados</option>
            <option value="abierta">Abierta</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelta">Resuelta</option>
            <option value="cerrada">Cerrada</option>
          </select>
          <button
            type="button"
            onClick={() => { setPage(1); loadIncidents(1); }}
            className="rounded-lg bg-[#004ac6] px-4 py-3 text-sm font-bold text-white hover:bg-[#003ea6]"
          >
            Filtrar
          </button>
        </div>

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {loading ? (
          <LoadingBlock />
        ) : incidents.length === 0 ? (
          <EmptyState title="Sin incidencias" description="No hay incidencias para los filtros seleccionados." />
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <article key={incident.idIncidencia} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-black text-slate-950">{incident.titulo}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{incident.descripcion || incident.categoria || 'Sin descripción'}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-700">
                      {incident.severidad || 'media'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">
                      {incident.estadoIncidencia || 'abierta'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => handleEdit(incident)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"><Pencil size={15} /></button>
                  <button type="button" onClick={() => setDeleteTarget(incident)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(next) => { setPage(next); loadIncidents(next); }} />
      </Panel>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar incidencia' : 'Nueva incidencia'} description="Registra eventos de seguridad investigables.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextInput label="Código" value={form.codigoIncidencia} onChange={(value) => setForm({ ...form, codigoIncidencia: value })} />
          <TextInput label="Título" value={form.titulo} onChange={(value) => setForm({ ...form, titulo: value })} />
          <SelectInput label="Severidad" value={form.severidad} onChange={(value) => setForm({ ...form, severidad: value })} options={[{ value: 'critico', label: 'Crítico' }, { value: 'alto', label: 'Alto' }, { value: 'medio', label: 'Medio' }, { value: 'bajo', label: 'Bajo' }]} />
          <SelectInput label="Estado" value={form.estadoIncidencia} onChange={(value) => setForm({ ...form, estadoIncidencia: value })} options={[{ value: 'abierta', label: 'Abierta' }, { value: 'en_revision', label: 'En revisión' }, { value: 'resuelta', label: 'Resuelta' }]} />
          <TextArea label="Resumen" value={form.resumenEvento} onChange={(value) => setForm({ ...form, resumenEvento: value })} />
          <TextInput label="IP origen" required={false} value={form.ipOrigen} onChange={(value) => setForm({ ...form, ipOrigen: value })} />
          <TextInput label="Dispositivo/navegador" required={false} value={form.dispositivoNavegador} onChange={(value) => setForm({ ...form, dispositivoNavegador: value })} />
          <TextArea label="Recomendación" required={false} rows={3} value={form.recomendacion} onChange={(value) => setForm({ ...form, recomendacion: value })} />
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60">
            <Plus size={16} />
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear incidencia'}
          </button>
        </form>
      </Modal>
      </div>
      <ConfirmDialog open={Boolean(deleteTarget)} title="Eliminar incidencia" description={`Vas a eliminar "${deleteTarget?.titulo || 'esta incidencia'}".`} confirmLabel="Eliminar" onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </>
  );
}
