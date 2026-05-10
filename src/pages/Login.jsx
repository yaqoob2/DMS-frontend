import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message[0]
          : err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-br from-white via-slate-50 to-blue-100 flex items-center justify-center px-4 py-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_32%)]" />

      {/* Softer background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Corner circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full border border-white/70" />
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full border border-white/70" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full border border-white/70" />
      <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full border border-white/70" />

      <div className="relative w-full max-w-lg">
        {/* Logo + Branding */}
        <div className="flex items-center justify-center gap-5 mb-3">
          <img
            src="/logo.jpg"
            alt="DMS ConnectHub Logo"
            className="w-24 h-24 object-contain"
          />

          <div>
            <h1 className="text-5xl font-extrabold text-slate-950 tracking-tight leading-none">
              DMS
            </h1>

            <p className="text-4xl font-light text-slate-950 leading-tight">
              Connect
              <span className="font-semibold text-sky-500">Hub</span>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-base font-medium mb-6">
          Private Company Document Repository
        </p>

        {/* Login Card */}
        <div className="max-w-md mx-auto bg-white/75 backdrop-blur-2xl border border-white/90 rounded-[1.8rem] p-8 shadow-2xl shadow-blue-200/40">
          <h2 className="text-3xl font-extrabold text-slate-950 mb-1">
            Welcome back
          </h2>

          <p className="text-slate-500 text-base mb-6">
            Sign in securely to continue
          </p>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-800 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-13 bg-white/80 border border-blue-100 text-slate-900 placeholder-slate-400 rounded-2xl px-5 text-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 shadow-md shadow-slate-200/40"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-800 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-13 bg-white/80 border border-blue-100 text-slate-900 placeholder-slate-400 rounded-2xl px-5 pr-32 text-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 shadow-md shadow-slate-200/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-blue-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5"
            >
              {loading && (
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}

              {loading ? 'Signing in…' : 'Sign in'}

              {!loading && (
                <span className="text-xl leading-none">›</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © {new Date().getFullYear()}{' '}
          <span className="text-blue-600 font-semibold">
            DMS ConnectHub
          </span>{' '}
          — Private &amp; Confidential
        </p>
      </div>
    </div>
  );
}