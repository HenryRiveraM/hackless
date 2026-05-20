import { Eye, Play, Trash2, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SelectInput, TextInput } from '../components/FormControls';
import { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Panel, StatusMessage, ToastStack } from '../components/Ui';
import useToasts from '../hooks/useToasts';
import { deleteAudit, generateAuditResults, getAudits, runAudit } from '../services/auditsService';

export default function AuditsPage() {
  const [audits, setAudits] = useState([]);
  const [form, setForm] = useState({ tipo: 'email_check', target: '' });
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function loadAudits() {
    setLoading(true);
    setError('');
    try {
      const data = await getAudits({ pageSize: 20 });
      setAudits(data.items || []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las auditorías');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(loadAudits, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await runAudit(form);
      setForm({ ...form, target: '' });
      showToast({ title: 'Auditoría ejecutada' });
      await loadAudits();
    } catch (err) {
      setError(err.message || 'No se pudo ejecutar la auditoría');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader title="Auditorías" description="Ejecución y seguimiento de revisiones de correo, puertos y objetivos técnicos." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Panel className="p-5">
          {error && <StatusMessage type="error">{error}</StatusMessage>}
          {loading ? <LoadingBlock /> : audits.length === 0 ? <EmptyState title="Sin auditorías" description="Ejecuta la primera auditoría para ver resultados." /> : (
            <div className="space-y-3">
              {audits.map((audit) => (
                <article key={audit.idAuditoria} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-black text-slate-950">{audit.target || audit.objetivo || 'Objetivo auditado'}</h2>
                      <p className="text-sm text-slate-500">{audit.tipo} · {audit.estadoAuditoria || audit.estado || 'registrada'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setDetail(audit)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50" type="button">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => generateAuditResults(audit.idAuditoria).then(() => { showToast({ title: 'Resultados generados' }); loadAudits(); })} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50" type="button">
                        <Wand2 size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(audit)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" type="button">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
        <Panel className="p-5">
          <h2 className="mb-5 text-lg font-black text-slate-950">Nueva auditoría</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <SelectInput
              label="Tipo"
              value={form.tipo}
              onChange={(value) => setForm({ ...form, tipo: value })}
              options={[
                { value: 'email_check', label: 'Correo comprometido' },
                { value: 'port_scan', label: 'Escaneo de puertos' },
              ]}
            />
            <TextInput label="Objetivo" placeholder="correo@empresa.com o dominio/IP" value={form.target} onChange={(value) => setForm({ ...form, target: value })} />
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60">
              <Play size={16} />
              {saving ? 'Ejecutando...' : 'Ejecutar auditoría'}
            </button>
          </form>
        </Panel>
      </div>
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.target || 'Auditoría'} description={`${detail?.tipo || ''} · ${detail?.estadoAuditoria || ''}`}>
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p><strong className="text-slate-900">Resumen:</strong> {detail?.resumenResultado || 'Sin resumen'}</p>
          <p><strong className="text-slate-900">Detalle:</strong> {detail?.detalleResultado || 'Sin detalle'}</p>
          <p><strong className="text-slate-900">Fecha:</strong> {detail?.fechaAuditoria || '-'}</p>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar auditoría"
        description={`Vas a eliminar la auditoría de ${deleteTarget?.target || 'este objetivo'}.`}
        confirmLabel="Eliminar"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteAudit(deleteTarget.idAuditoria).then(() => { setDeleteTarget(null); showToast({ title: 'Auditoría eliminada' }); loadAudits(); })}
      />
    </>
  );
}
