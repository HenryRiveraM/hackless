import { AlertTriangle, Bell, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, LoadingBlock, PageHeader, Panel, StatusMessage } from '../components/Ui';
import { completeRecommendation, getRecommendations, getSummary } from '../services/dashboardService';
import { getAlerts, getAlertsSummary, getIncidents, getIncidentsSummary } from '../services/securityService';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [alertsSummary, setAlertsSummary] = useState(null);
  const [incidentsSummary, setIncidentsSummary] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const [dashboardData, recommendationsData, alertsData, incidentsData, alertsList, incidentsList] = await Promise.all([
        getSummary(),
        getRecommendations({ estadoRecomendacion: 'pendiente' }),
        getAlertsSummary().catch(() => null),
        getIncidentsSummary().catch(() => null),
        getAlerts({ pageSize: 3 }).catch(() => ({ items: [] })),
        getIncidents({ pageSize: 3 }).catch(() => ({ items: [] })),
      ]);

      setSummary(dashboardData);
      setRecommendations(recommendationsData);
      setAlertsSummary(alertsData);
      setIncidentsSummary(incidentsData);
      setRecentAlerts(alertsList.items || []);
      setRecentIncidents(incidentsList.items || []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const progressData = useMemo(() => {
    if (!summary?.progresoCapacitacion?.length) {
      return [
        { mes: 'Mes 1', cantidad: 0 },
        { mes: 'Mes 2', cantidad: 0 },
        { mes: 'Mes 3', cantidad: 0 },
        { mes: 'Mes 4', cantidad: 0 },
        { mes: 'Mes 5', cantidad: 0 },
        { mes: 'Mes 6', cantidad: 0 },
      ];
    }

    return summary.progresoCapacitacion;
  }, [summary]);

  const handleComplete = async (id) => {
    await completeRecommendation(id);
    setRecommendations((current) => current.filter((item) => item.idRecomendacion !== id));
  };

  if (loading) {
    return <LoadingBlock label="Conectando..." />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista operativa conectada con los módulos de seguridad, capacitación, phishing y recomendaciones."
      />

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      {!error && summary && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={ShieldCheck}
              label="Puntaje de seguridad"
              value={`${summary.puntajeSeguridad ?? 0}%`}
              detail={`Riesgo ${summary.nivelRiesgo || 'sin datos'}`}
              tone="blue"
            />
            <MetricCard
              icon={Users}
              label="Empleados capacitados"
              value={`${summary.empleadosCapacitados ?? 0}/${summary.totalEmpleados ?? 0}`}
              detail={`${summary.capacitacionesPendientes ?? 0} pendientes`}
              tone="emerald"
            />
            <MetricCard
              icon={Bell}
              label="Alertas activas"
              value={alertsSummary?.totalAlertas ?? alertsSummary?.total ?? '0'}
              detail="Desde el módulo de alertas"
              tone="amber"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Incidencias abiertas"
              value={incidentsSummary?.abiertas ?? incidentsSummary?.totalAbiertas ?? incidentsSummary?.total ?? '0'}
              detail={`${summary.puertosAbiertosDetectados ?? 0} posibles puertos`}
              tone="red"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <Panel className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Progreso de capacitación</h2>
                  <p className="text-sm text-slate-500">Últimos meses reportados por backend</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="training" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" stroke="#64748b" tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="cantidad" stroke="#2563eb" fill="url(#training)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel className="p-5">
              <h2 className="text-lg font-black text-slate-950">Recomendaciones</h2>
              <p className="mb-4 text-sm text-slate-500">Acciones pendientes priorizadas</p>
              {recommendations.length === 0 ? (
                <EmptyState title="Sin recomendaciones pendientes" description="Cuando el backend genere acciones, aparecerán aquí." />
              ) : (
                <div className="space-y-3">
                  {recommendations.slice(0, 5).map((item) => (
                    <div key={item.idRecomendacion} className="rounded-lg border border-slate-200 p-4">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-950">{item.titulo}</h3>
                        <PriorityBadge value={item.prioridad} />
                      </div>
                      {item.descripcion && <p className="mb-3 text-sm leading-6 text-slate-600">{item.descripcion}</p>}
                      <button
                        type="button"
                        onClick={() => handleComplete(item.idRecomendacion)}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
                      >
                        <CheckCircle2 size={14} />
                        Marcar completada
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel className="p-5">
              <h2 className="text-lg font-black text-slate-950">Alertas recientes</h2>
              <p className="mb-4 text-sm text-slate-500">Señales activas desde el módulo de alertas</p>
              {recentAlerts.length === 0 ? <EmptyState title="Sin alertas recientes" /> : (
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.idAlerta} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-slate-950">{alert.titulo}</p>
                        <PriorityBadge value={alert.severidad === 'critica' ? 'urgente' : alert.severidad === 'alta' ? 'atencion' : 'baja'} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{alert.categoria} · {alert.estadoAlerta}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="p-5">
              <h2 className="text-lg font-black text-slate-950">Incidencias recientes</h2>
              <p className="mb-4 text-sm text-slate-500">Eventos que requieren seguimiento operativo</p>
              {recentIncidents.length === 0 ? <EmptyState title="Sin incidencias recientes" /> : (
                <div className="space-y-3">
                  {recentIncidents.map((incident) => (
                    <div key={incident.idIncidencia} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-slate-950">{incident.titulo}</p>
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-700">{incident.severidad}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{incident.codigoIncidencia} · {incident.estadoIncidencia}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <Panel className="p-5">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{detail}</p>
    </Panel>
  );
}

function PriorityBadge({ value }) {
  const styles = {
    urgente: 'bg-red-100 text-red-700',
    atencion: 'bg-amber-100 text-amber-700',
    baja: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-black ${styles[value] || styles.baja}`}>
      {value || 'baja'}
    </span>
  );
}
