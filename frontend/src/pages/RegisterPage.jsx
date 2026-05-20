import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    industria: '',
    nit: '',
    nombre_admin: '',
    email_corporativo: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Education',
    'Government',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!formData.nombre_empresa || !formData.industria || !formData.nit || !formData.nombre_admin || !formData.email_corporativo || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.registerCompany(
        formData.nombre_empresa,
        formData.industria,
        formData.nit,
        formData.nombre_admin,
        formData.email_corporativo,
        formData.password,
        formData.confirmPassword
      );

      if (result.success) {
        setSuccess('Empresa registrada exitosamente. Redirigiendo...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(result.message || 'Error al crear la empresa');
      }
    } catch {
      setError('Error inesperado. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col">
      <header className="bg-[#f7f9fb] border-b border-[#c3c6d7] shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-[#004ac6]">
              Hackless
            </Link>

            <nav className="hidden md:flex gap-6">
              {["Solutions", "Training", "Audit", "Pricing", "Company"].map((item) => (
                <a
                  key={item}
                  className="text-sm font-semibold text-[#434655] hover:text-[#004ac6] transition-colors"
                  href="#"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#434655] hover:text-[#004ac6]"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-[#2563eb] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#004ac6] transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <section className="lg:col-span-5 flex flex-col justify-center space-y-8 p-8 bg-white rounded-xl border border-[#c3c6d7] shadow-md">
            <div>
              <span className="material-symbols-outlined text-[#004ac6] text-5xl mb-4">
                shield_lock
              </span>

              <h1 className="text-5xl font-bold text-[#004ac6] mb-4 leading-tight tracking-tight">
                Secure your enterprise perimeter.
              </h1>

              <p className="text-lg leading-relaxed text-[#434655]">
                Join SMEs that trust Hackless for cybersecurity management,
                training and basic security auditing.
              </p>
            </div>

            <div className="space-y-6">
              <TrustItem
                icon="verified_user"
                title="ISO 27001 Certified"
                bg="#dbe1ff"
                text="#00174b"
              >
                Our platform follows strong security standards for data protection.
              </TrustItem>

              <TrustItem
                icon="gpp_good"
                title="End-to-End Encryption"
                bg="#c4e7ff"
                text="#001e2c"
              >
                Your corporate data is protected during registration and platform usage.
              </TrustItem>
            </div>

            <div className="mt-8 p-6 bg-[#f2f4f6] rounded-xl border-l-4 border-[#004ac6]">
              <p className="text-sm leading-relaxed text-[#434655] italic">
                "We treat your data with the same intensity we treat threats.
                Your privacy is our primary mandate."
              </p>
            </div>
          </section>

          <section className="lg:col-span-7 bg-white p-8 lg:p-12 rounded-xl border border-[#c3c6d7] shadow-md">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-semibold text-[#191c1e] mb-2">
                Company Registration
              </h2>
              <p className="text-base text-[#434655]">
                Complete the details below to initialize your security dashboard.
              </p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              {error && (
                <div className="md:col-span-2 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="md:col-span-2 p-4 bg-green-100 border border-green-300 rounded-xl text-green-700 text-sm">
                  {success}
                </div>
              )}

              <Input
                label="Company Name"
                placeholder="e.g. Acme Corp"
                name="nombre_empresa"
                value={formData.nombre_empresa}
                onChange={handleInputChange}
                disabled={loading}
              />

              <Select
                label="Industry"
                name="industria"
                value={formData.industria}
                onChange={handleInputChange}
                options={industries}
                disabled={loading}
              />

              <Input
                label="NIT/ID Number"
                placeholder="Tax Identification"
                name="nit"
                value={formData.nit}
                onChange={handleInputChange}
                disabled={loading}
              />

              <Input
                label="Admin Name"
                placeholder="Full legal name"
                name="nombre_admin"
                value={formData.nombre_admin}
                onChange={handleInputChange}
                disabled={loading}
              />

              <Input
                label="Corporate Email"
                placeholder="admin@company.com"
                type="email"
                name="email_corporativo"
                value={formData.email_corporativo}
                onChange={handleInputChange}
                disabled={loading}
                className="md:col-span-2"
              />

              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />

              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
              />

              <div className="md:col-span-2 mt-4">
                <button
                  className="w-full bg-[#004ac6] text-white py-4 rounded-xl text-xl font-semibold shadow-md hover:bg-[#004ac6]/90 hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Creando cuenta...' : 'Crear cuenta'}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>

              <p className="md:col-span-2 text-center text-xs text-[#434655] mt-2">
                By registering, you agree to our{" "}
                <a className="text-[#004ac6] hover:underline" href="#">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a className="text-[#004ac6] hover:underline" href="#">
                  Master Services Agreement
                </a>
                .
              </p>
            </form>
          </section>
        </div>
      </main>

      <footer className="bg-[#e0e3e5] border-t border-[#c3c6d7]">
        <div className="w-full py-12 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-[1280px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-xl font-bold text-[#004ac6]">Hackless</span>
            <p className="text-sm text-[#191c1e]">
              © 2026 Hackless Security. All rights reserved. ISO 27001 Certified.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security Disclosure", "SLA", "Help Center"].map(
              (item) => (
                <a
                  key={item}
                  className="text-xs text-[#434655] hover:text-[#191c1e] hover:underline"
                  href="#"
                >
                  {item}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustItem({ icon, title, children, bg, text }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: bg, color: text }}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#191c1e]">{title}</h3>
        <p className="text-sm leading-relaxed text-[#434655]">{children}</p>
      </div>
    </div>
  );
}

function Input({ label, placeholder, type = "text", className = "", name, value, onChange, disabled = false }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-semibold text-[#434655]">{label}</label>
      <input
        className="w-full px-4 py-3 rounded-xl border border-[#737686] hover:border-[#004ac6] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options, disabled = false }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[#434655]">{label}</label>
      <select
        className="w-full px-4 py-3 rounded-xl border border-[#737686] hover:border-[#004ac6] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required
      >
        <option value="">Select an industry</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function PasswordInput({ label, name, value, onChange, disabled = false }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[#434655]">{label}</label>
      <div className="relative">
        <input
          className="w-full px-4 py-3 pr-12 rounded-xl border border-[#737686] hover:border-[#004ac6] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="••••••••"
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6]"
          onClick={() => setShowPassword(!showPassword)}
        >
          <span className="material-symbols-outlined">
            {showPassword ? 'visibility' : 'visibility_off'}
          </span>
        </button>
      </div>
    </div>
  );
}
