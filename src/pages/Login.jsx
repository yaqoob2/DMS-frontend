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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-white via-slate-50 to-blue-100 px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_32%)]" />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3">
          <img
            src="/logo.jpg"
            alt="DMS ConnectHub Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0"
          />

          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-none">
              DMS
            </h1>

            <p className="text-3xl sm:text-4xl font-light text-slate-950 leading-tight">
              Connect
              <span className="font-semibold text-sky-500">Hub</span>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm sm:text-base font-medium mb-5 sm:mb-6">
          Private Company Document Repository
        </p>

        <div className="w-full bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-blue-200/40">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-1">
            Welcome back
          </h2>

          <p className="text-slate-500 text-sm sm:text-base mb-5 sm:mb-6">
            Sign in securely to continue
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-2">
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
                className="w-full h-14 bg-white/90 border border-blue-100 text-slate-900 placeholder-slate-400 rounded-2xl px-4 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 shadow-md shadow-slate-200/40"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-2">
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
                  className="w-full h-14 bg-white/90 border border-blue-100 text-slate-900 placeholder-slate-400 rounded-2xl px-4 pr-28 text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 shadow-md shadow-slate-200/40"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base shadow-xl shadow-blue-500/25"
            >
              {loading && (
                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <span className="text-xl leading-none">›</span>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs sm:text-sm text-slate-500 mt-5">
          © {new Date().getFullYear()}{' '}
          <span className="text-blue-600 font-semibold">DMS ConnectHub</span>{' '}
          — Private &amp; Confidential
        </p>
      </div>
    </div>
  );
}