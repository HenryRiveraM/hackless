import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function EmployeeSelector({ selected = [], onSelect, employees = [] }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const filtered = employees.filter((emp) =>
    search.toLowerCase() === '' ||
    emp.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    emp.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.id_empleado?.toString().includes(search)
  );

  const isSelected = (empId) => selected.includes(empId);

  const toggleEmployee = (empId) => {
    if (isSelected(empId)) {
      onSelect(selected.filter((id) => id !== empId));
    } else {
      onSelect([...selected, empId]);
    }
  };

  const removeEmployee = (empId) => {
    onSelect(selected.filter((id) => id !== empId));
  };

  const getEmployeeId = (emp) => emp.idEmpleado || emp.id_empleado || emp.id;

  const getEmployeeName = (empId) => {
    const emp = employees.find((e) => getEmployeeId(e) === empId);
    return emp?.nombre || `ID: ${empId}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">Empleados</label>

      {/* Selected employees as chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {selected.map((empId) => (
            <div key={empId} className="flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium">
              {getEmployeeName(empId)}
              <button
                type="button"
                onClick={() => removeEmployee(empId)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={searchRef} className="relative">
        <input
          type="text"
          placeholder="Buscar empleado por nombre, email o ID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((emp) => {
                const empId = getEmployeeId(emp);
                return (
                  <button
                    key={empId}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleEmployee(empId);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 flex items-center gap-2 ${
                      isSelected(empId) ? 'bg-blue-50 text-blue-900 font-semibold' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(empId)}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{emp.nombre}</div>
                      <div className="text-xs text-slate-500">{emp.email}</div>
                    </div>
                    {emp.departamento && <span className="text-xs text-slate-600">{emp.departamento}</span>}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500 text-center">Sin resultados</div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">{selected.length} empleado(s) seleccionado(s)</p>
    </div>
  );
}
