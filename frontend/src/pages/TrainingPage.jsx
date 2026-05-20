import { BookOpenCheck, CheckCircle2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState, LoadingBlock, PageHeader, Panel, StatusMessage } from '../components/Ui';
import { getLessonContent, getLessons, getTrainingDashboard, startLesson, updateLessonProgress } from '../services/trainingService';

export default function TrainingPage() {
  const [dashboard, setDashboard] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, lessonsData] = await Promise.all([
        getTrainingDashboard().catch(() => null),
        getLessons(),
      ]);
      setDashboard(dashboardData);
      setLessons(lessonsData);
    } catch (err) {
      setError(err.message || 'No se pudo cargar capacitación');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(load, 0);
    return () => window.clearTimeout(id);
  }, []);

  async function openLesson(id) {
    await startLesson(id).catch(() => null);
    const content = await getLessonContent(id).catch(() => null);
    setSelected(content);
  }

  async function completeLesson(id) {
    await updateLessonProgress(id, { progreso: 100, puntaje: 100 });
    await load();
  }

  return (
    <>
      <PageHeader title="Capacitación" description="Lecciones reales, progreso y contenido conectado a `/api/capacitacion`." />
      {error && <StatusMessage type="error">{error}</StatusMessage>}
      {loading ? <LoadingBlock /> : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-5">
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Progreso" value={`${dashboard?.progresoGeneral ?? dashboard?.resumen?.progresoGeneral ?? 0}%`} />
              <Metric label="Ranking" value={dashboard?.ranking ?? '-'} />
              <Metric label="Insignia" value={dashboard?.ultimaInsignia?.nombre || '-'} />
            </div>
            {lessons.length === 0 ? <EmptyState title="Sin lecciones" description="No hay lecciones disponibles para este usuario." /> : (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <article key={lesson.idLeccion} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-black text-slate-950">{lesson.titulo}</h2>
                        <p className="text-sm leading-6 text-slate-600">{lesson.descripcion}</p>
                      </div>
                      {lesson.completada ? <CheckCircle2 className="text-emerald-600" /> : <BookOpenCheck className="text-blue-600" />}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => openLesson(lesson.idLeccion)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white" type="button">
                        <Play size={14} />
                        Abrir
                      </button>
                      <button onClick={() => completeLesson(lesson.idLeccion)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700" type="button">
                        Completar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
          <Panel className="p-5">
            <h2 className="mb-4 text-lg font-black text-slate-950">{selected?.titulo || 'Contenido de lección'}</h2>
            {!selected ? <EmptyState title="Selecciona una lección" description="El contenido aparecerá en este panel." /> : (
              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-600">{selected.descripcion}</p>
                {(selected.contenido || []).map((item) => (
                  <div key={item.idContenido || item.orden} className="rounded-lg bg-slate-50 p-4">
                    <h3 className="font-bold text-slate-950">{item.titulo || item.tipoContenido}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.contenido}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="truncate text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}
