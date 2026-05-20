import { Pencil, Plus, Search, Trash2, UserRoundCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ConfirmDialog, EmptyState, LoadingBlock, Modal, PageHeader, Pagination, Panel, StatusMessage, ToastStack } from '../components/Ui';
import { SelectInput, TextInput } from '../components/FormControls';
import useToasts from '../hooks/useToasts';
import { getUser, refreshCurrentUser } from '../services/authService';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '../services/securityService';

const emptyForm = {
  nombre: '',
  email: '',
  departamento: '',
  puntajeSeguridad: 70,
  estadoCapacitacion: 'pendiente',
};

export default function EmployeesPage() {
  const [user, setUser] = useState(getUser());
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { dismiss, showToast, toasts } = useToasts();

  async function ensureUser() {
    if (user?.id_empresa) return user;
    const freshUser = await refreshCurrentUser();
    setUser(freshUser);
    return freshUser;
  }

  async function loadEmployees(query = search, nextPage = page) {
    setLoading(true);
    setError('');

    try {
      const currentUser = await ensureUser();
      if (!currentUser?.id_empresa) {
        throw new Error('Tu usuario no tiene una empresa asociada todavía.');
      }

      const data = await getEmployees({ idEmpresa: currentUser.id_empresa, busqueda: query, page: nextPage, pageSize });
      setEmployees(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadEmployees('', 1);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = await ensureUser();
      const payload = { ...form, puntajeSeguridad: Number(form.puntajeSeguridad) };
      if (editingId) {
        await updateEmployee(editingId, payload);
      } else {
        await createEmployee({ ...payload, idEmpresa: currentUser.id_empresa });
      }
      setForm(emptyForm);
      setEditingId(null);
      setModalOpen(false);
      setSuccess(editingId ? 'Empleado actualizado correctamente.' : 'Empleado creado correctamente.');
      showToast({ title: editingId ? 'Empleado actualizado' : 'Empleado creado' });
      await loadEmployees();
    } catch (err) {
      setError(err.message || 'No se pudo crear el empleado');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.idEmpleado);
    setForm({
      nombre: employee.nombre || '',
      email: employee.email || '',
      departamento: employee.departamento || '',
      puntajeSeguridad: employee.puntajeSeguridad ?? 70,
      estadoCapacitacion: employee.estadoCapacitacion || 'pendiente',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    setDeleteTarget(null);
    showToast({ title: 'Empleado eliminado' });
    await loadEmployees();
  };

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
      <PageHeader
        title="Empleados"
        description="Gestión conectada con `/api/empleados`, usando la empresa del usuario autenticado."
        action={
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setEditingId(null); setForm(emptyForm); setModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#004ac6] px-3 py-2 text-sm font-black text-white shadow-sm hover:bg-[#003ea6]"
          >
            <Plus size={16} />
            Nuevo
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
            <UserRoundCheck size={16} />
            {total} registrados
          </div>
          </div>
        }
      />

      <div>
        <Panel className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') { setPage(1); loadEmployees(search, 1); }
                }}
                placeholder="Buscar por nombre, email o departamento"
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/15"
              />
            </div>
            <button
              type="button"
              onClick={() => { setPage(1); loadEmployees(search, 1); }}
              className="rounded-lg bg-[#004ac6] px-4 py-3 text-sm font-bold text-white hover:bg-[#003ea6]"
            >
              Buscar
            </button>
          </div>

          {error && <StatusMessage type="error">{error}</StatusMessage>}
          {success && <div className="mb-4"><StatusMessage type="success">{success}</StatusMessage></div>}

          {loading ? (
            <LoadingBlock />
          ) : employees.length === 0 ? (
            <EmptyState title="No hay empleados" description="Crea el primer empleado para empezar capacitación y medición de riesgo." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Puntaje</th>
                    <th className="px-4 py-3">Capacitación</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employees.map((employee) => (
                    <tr key={employee.idEmpleado} className="bg-white">
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">{employee.nombre}</p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{employee.departamento || 'Sin asignar'}</td>
                      <td className="px-4 py-4 font-black text-slate-950">{employee.puntajeSeguridad ?? 0}%</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          {employee.estadoCapacitacion}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{employee.estado ? 'Activo' : 'Inactivo'}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEdit(employee)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50">
                            <Pencil size={15} />
                          </button>
                          <button type="button" onClick={() => setDeleteTarget(employee)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(next) => { setPage(next); loadEmployees(search, next); }} />
        </Panel>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar empleado' : 'Nuevo empleado'} description="Se registrará en la empresa asociada a tu sesión.">
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextInput label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} />
            <TextInput label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <TextInput label="Departamento" value={form.departamento} onChange={(value) => setForm({ ...form, departamento: value })} />
            <TextInput
              label="Puntaje"
              type="number"
              min="0"
              max="100"
              value={form.puntajeSeguridad}
              onChange={(value) => setForm({ ...form, puntajeSeguridad: value })}
            />
            <SelectInput label="Estado de capacitación" value={form.estadoCapacitacion} onChange={(value) => setForm({ ...form, estadoCapacitacion: value })} options={[
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'en_progreso', label: 'En progreso' },
              { value: 'completado', label: 'Completado' },
              { value: 'vencido', label: 'Vencido' },
            ]} />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60"
            >
              <Plus size={16} />
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear empleado'}
            </button>
          </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar empleado"
        description={`Vas a eliminar a ${deleteTarget?.nombre || 'este empleado'}. Esta acción lo ocultará de la operación activa.`}
        confirmLabel="Eliminar"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget.idEmpleado)}
      />
    </>
  );
}
