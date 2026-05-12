export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f7f9fb] text-[#191c1e]">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#004ac6] to-[#00668a] relative items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-white/20">
              <span className="material-symbols-outlined text-[#004ac6] text-[64px]">
                shield_with_heart
              </span>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Tu seguridad es nuestra prioridad.
          </h1>

          <p className="text-lg text-[#c4e7ff] leading-relaxed mb-10 opacity-90">
            Únete a empresas que confían en Hackless para proteger su infraestructura digital con auditorías inteligentes.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-left flex items-center gap-6">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-400 flex items-center justify-center">
              <span className="text-white font-bold text-xl">99%</span>
            </div>
            <div>
              <h4 className="text-white font-bold text-xl">Puntaje de Resiliencia</h4>
              <p className="text-[#c4e7ff] text-sm">Protección activa contra amenazas digitales.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#f7f9fb]">
        <div className="md:hidden mb-12 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl">shield</span>
          <span className="text-2xl font-black text-[#004ac6]">Hackless</span>
        </div>

        <div className="w-full max-w-[440px]">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-semibold text-[#191c1e] mb-3">
              Bienvenido de nuevo
            </h2>
            <p className="text-[#434655]">
              Accede a tu panel de control de seguridad de Hackless.
            </p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#434655] px-1">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686]">
                  mail
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f2f4f6] border border-[#c3c6d7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="nombre@empresa.com"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-[#434655]">
                  Contraseña
                </label>
                <a className="text-xs font-medium text-[#004ac6] hover:underline" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686]">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-12 py-3.5 bg-[#f2f4f6] border border-[#c3c6d7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6]"
                  placeholder="••••••••"
                  type="password"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686]" type="button">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>

            <button
              className="w-full bg-[#004ac6] hover:bg-[#004ac6]/90 text-white font-semibold py-4 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              type="submit"
            >
              <span>Iniciar sesión</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <div className="relative flex items-center gap-4 py-4">
              <div className="flex-grow border-t border-[#c3c6d7]" />
              <span className="text-xs text-[#737686] px-2 uppercase tracking-widest">
                O entrar con
              </span>
              <div className="flex-grow border-t border-[#c3c6d7]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="py-3 px-4 border border-[#c3c6d7] rounded-xl text-sm hover:bg-[#e6e8ea]">
                Google
              </button>
              <button className="py-3 px-4 border border-[#c3c6d7] rounded-xl text-sm hover:bg-[#e6e8ea] flex justify-center gap-2">
                <span className="material-symbols-outlined">terminal</span>
                SSO
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-[#434655]">
              ¿No tienes una cuenta?
              <a className="text-[#004ac6] font-bold hover:underline ml-1" href="#">
                Crear cuenta
              </a>
            </p>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center">
          <p className="text-xs text-[#737686]">
            © 2026 Hackless Security. ISO 27001 Certified.
          </p>
        </div>
      </div>
    </div>
  );
}