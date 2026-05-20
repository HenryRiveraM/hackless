import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';

function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-normal text-slate-950">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function StatusMessage({ type = 'info', children }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  };

  return <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${styles[type]}`}>{children}</div>;
}

function LoadingBlock({ label = 'Cargando datos...' }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
        <Loader2 className="animate-spin" size={18} />
        {label}
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <p className="font-bold text-slate-900">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

function Modal({ title, description, open, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl border border-slate-200 bg-white shadow-2xl sm:max-w-xl sm:rounded-lg">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, title = 'Confirmar acción', description, confirmLabel = 'Confirmar', onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[90] w-[calc(100%-2rem)] max-w-sm space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          {toast.type === 'error' ? <XCircle className="mt-0.5 text-red-600" size={18} /> : <CheckCircle2 className="mt-0.5 text-emerald-600" size={18} />}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-950">{toast.title}</p>
            {toast.message && <p className="mt-1 text-sm text-slate-600">{toast.message}</p>}
          </div>
          <button type="button" onClick={() => onDismiss(toast.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Página {page} de {totalPages} · {total || 0} registros
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Pagination, Panel, StatusMessage, ToastStack };
