import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  FileText,
  GraduationCap,
  HelpCircle,
  LogOut,
  MailWarning,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/employees', label: 'Empleados', icon: Users },
  { to: '/alerts', label: 'Alertas', icon: Bell },
  { to: '/incidents', label: 'Incidencias', icon: AlertTriangle },
  { to: '/reports', label: 'Reportes', icon: FileText },
  { to: '/audits', label: 'Auditorías', icon: Bot },
  { to: '/phishing', label: 'Phishing', icon: MailWarning },
  { to: '/training', label: 'Capacitación', icon: GraduationCap },
  { to: '/help', label: 'Ayuda', icon: HelpCircle },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#17202a]">
      <header className="lg:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-black text-[#004ac6]">
            <Shield size={24} />
            Hackless
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Abrir navegación"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 px-6">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#004ac6] text-white">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-lg font-black text-[#004ac6]">Hackless</p>
              <p className="text-xs font-medium text-slate-500">Security Platform</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#eaf1ff] text-[#004ac6]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-200 p-4">
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              <p className="truncate text-sm font-bold text-slate-900">{user?.nombre || 'Usuario'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
              {user?.nombre_empresa && (
                <p className="mt-1 truncate text-xs font-semibold text-[#004ac6]">{user.nombre_empresa}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
