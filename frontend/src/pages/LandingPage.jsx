import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen">
      <header className="bg-[#f7f9fb] border-b border-[#c3c6d7] shadow-sm sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-[1280px] mx-auto">
          <div className="text-2xl font-bold text-[#004ac6]">Hackless</div>

          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-bold text-[#004ac6] border-b-2 border-[#004ac6] pb-1" href="#">
              Soluciones
            </a>
            <a className="text-sm font-semibold text-[#434655] hover:text-[#004ac6]" href="#">
              Capacitación
            </a>
            <a className="text-sm font-semibold text-[#434655] hover:text-[#004ac6]" href="#">
              Auditoria
            </a>
            <a className="text-sm font-semibold text-[#434655] hover:text-[#004ac6]" href="#">
              Precios
            </a>
            <a className="text-sm font-semibold text-[#434655] hover:text-[#004ac6]" href="#">
              Empresa
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-semibold text-[#434655] hover:bg-[#f2f4f6] px-4 py-2 rounded-xl"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/login"
              className="bg-[#004ac6] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Empezar
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative pt-24 pb-32 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#dbe1ff] text-[#00174b] rounded-full mb-6">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span className="text-xs font-medium">Ciberseguridad Simplificada para PyMEs</span>
              </div>

              <h1 className="text-5xl font-bold text-[#191c1e] mb-6 leading-tight tracking-tight">
                Protege tu empresa antes de que sea tarde
              </h1>

              <p className="text-lg leading-relaxed text-[#434655] mb-10 max-w-xl">
                Capacitación interactiva y auditoría básica de ciberseguridad diseñada específicamente para pequeñas y medianas empresas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/login"
                  className="bg-[#004ac6] text-white text-sm font-semibold px-8 py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Comenzar ahora
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>

                <button className="border border-[#004ac6] text-[#004ac6] text-sm font-semibold px-8 py-4 rounded-xl hover:bg-[#f2f4f6] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Ver demo
                </button>
              </div>
            </div>

            <div className="flex-1 relative w-full">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#40c2fd] opacity-20 rounded-full blur-3xl" />

              <div className="relative bg-white rounded-3xl shadow-xl border border-[#c3c6d7] p-4">
                <div className="rounded-2xl bg-[#0f172a] p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-slate-400 text-xs">Security Score</p>
                      <h3 className="text-white text-2xl font-bold">87%</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-300">shield</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-slate-400 text-xs">Phishing</p>
                      <p className="text-white font-bold">12%</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-slate-400 text-xs">Audits</p>
                      <p className="text-white font-bold">24</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-slate-400 text-xs">Risk</p>
                      <p className="text-emerald-300 font-bold">Low</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                      <span className="text-slate-300 text-sm">Correos comprometidos</span>
                      <span className="text-yellow-300 text-sm font-bold">3</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                      <span className="text-slate-300 text-sm">Puertos abiertos</span>
                      <span className="text-red-300 text-sm font-bold">5</span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 flex justify-between">
                      <span className="text-slate-300 text-sm">Lecciones completadas</span>
                      <span className="text-emerald-300 text-sm font-bold">76%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-4">¿Tu empresa es vulnerable?</h2>
              <p className="text-base leading-relaxed text-[#434655] max-w-2xl mx-auto">
                Las amenazas más comunes son silenciosas, constantes y pueden afectar gravemente a una PyME sin preparación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ProblemCard icon="alternate_email" title="Phishing">
                Correos engañosos que roban información confidencial a tus empleados desprevenidos.
              </ProblemCard>

              <ProblemCard icon="key" title="Robo de Contraseñas">
                Uso de credenciales débiles para infiltrarse en tus sistemas y bases de datos críticas.
              </ProblemCard>

              <ProblemCard icon="lock_reset" title="Ransomware">
                Secuestro de archivos digitales exigiendo pagos para recuperar el acceso.
              </ProblemCard>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-semibold mb-6">La solución integral de Hackless</h2>

                <div className="space-y-8">
                  <SolutionItem icon="school" title="Capacitación Interactiva">
                    Módulos de aprendizaje para que tu equipo aprenda a detectar amenazas reales en minutos.
                  </SolutionItem>

                  <SolutionItem icon="security_update_good" title="Auditoría Básica de Seguridad">
                    Escaneo de activos digitales para identificar brechas antes de que sean explotadas.
                  </SolutionItem>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <FeatureTile icon="analytics" title="Reportes Claros" className="bg-[#2563eb] text-white" />
                <FeatureTile icon="sim_card_alert" title="Simulaciones de Phishing" className="bg-[#40c2fd] text-[#004d6a]" />
                <FeatureTile icon="speed" title="Fácil de usar" className="bg-[#e6e8ea] text-[#191c1e]" />
                <FeatureTile icon="group_off" title="Sin equipo técnico" className="bg-[#c3c6d7] text-[#191c1e]" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#004ac6] text-white">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <Benefit icon="savings" title="Bajo Costo">
                Pensado para el presupuesto de una PyME en crecimiento.
              </Benefit>
              <Benefit icon="touch_app" title="Fácil de usar">
                Sin configuraciones complejas ni servidores locales.
              </Benefit>
              <Benefit icon="verified_user" title="Sin equipo técnico">
                No necesitas un experto en IT para empezar.
              </Benefit>
              <Benefit icon="description" title="Reportes Claros">
                Informes simples que te dicen exactamente qué hacer.
              </Benefit>
              <Benefit icon="phishing" title="Simulaciones de Phishing">
                Prueba la resistencia de tu equipo con ataques controlados.
              </Benefit>
              <Benefit icon="dashboard_customize" title="Dashboard Visual">
                Toda tu seguridad centralizada en una pantalla intuitiva.
              </Benefit>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-[1280px] mx-auto px-6 md:px-8">
            <h2 className="text-3xl font-semibold text-center mb-16">¿Cómo funciona?</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <Step number="1" title="Regístrate">
                Configura tu cuenta en menos de 2 minutos y vincula a tu equipo.
              </Step>
              <Step number="2" title="Capacita a tus empleados">
                Ellos completan cursos cortos e interactivos sobre seguridad.
              </Step>
              <Step number="3" title="Auditoría y reportes">
                Visualiza el estado de seguridad y recibe consejos para mejorar.
              </Step>
            </div>

            <div className="mt-20 text-center">
              <Link
                to="/login"
                className="inline-flex bg-[#004ac6] text-white text-sm font-semibold px-10 py-4 rounded-xl hover:shadow-xl active:scale-95 transition-all"
              >
                Empieza Gratis Ahora
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#e0e3e5] border-t border-[#c3c6d7] w-full py-12 px-6 md:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="text-xl font-bold text-[#004ac6]">Hackless</div>
            <p className="text-sm text-[#434655]">
              Protegiendo el futuro digital de las PyMEs con tecnología accesible y capacitación humana.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <FooterColumn title="Explorar" links={["Inicio", "Funcionalidades", "Seguridad", "Contacto"]} />
            <FooterColumn title="Legal" links={["Privacy Policy", "Terms of Service", "Security Disclosure"]} />
            <FooterColumn title="Soporte" links={["Help Center", "SLA"]} />
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-[#c3c6d7] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#434655]">
            © 2026 Hackless Security. All rights reserved. ISO 27001 Certified.
          </p>

          <span className="flex items-center gap-1 text-[#004ac6]">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span className="text-xs font-medium">Secure Site</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

function ProblemCard({ icon, title, children }) {
  return (
    <div className="bg-[#f7f9fb] border border-[#c3c6d7] rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-center justify-center mb-6">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-[#434655]">{children}</p>
    </div>
  );
}

function SolutionItem({ icon, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-12 h-12 bg-[#c4e7ff] text-[#001e2c] rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-base leading-relaxed text-[#434655]">{children}</p>
      </div>
    </div>
  );
}

function FeatureTile({ icon, title, className }) {
  return (
    <div className={`${className} p-6 rounded-3xl aspect-square flex flex-col justify-end`}>
      <span className="material-symbols-outlined text-4xl mb-4">{icon}</span>
      <div className="text-sm font-semibold">{title}</div>
    </div>
  );
}

function Benefit({ icon, title, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="material-symbols-outlined text-[#c4e7ff] text-3xl">{icon}</span>
      <div>
        <h4 className="text-xl font-semibold mb-2">{title}</h4>
        <p className="text-sm leading-relaxed opacity-80">{children}</p>
      </div>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="relative text-center z-10">
      <div className="w-24 h-24 bg-white border-4 border-[#004ac6] text-[#004ac6] text-5xl font-bold flex items-center justify-center rounded-full mx-auto mb-6 shadow-md">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-base leading-relaxed text-[#434655] px-4">{children}</p>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-semibold text-[#191c1e]">{title}</span>
      {links.map((link) => (
        <a key={link} className="text-xs text-[#434655] hover:text-[#191c1e] hover:underline" href="#">
          {link}
        </a>
      ))}
    </div>
  );
}