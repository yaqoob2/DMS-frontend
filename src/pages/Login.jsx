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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-white via-slate-50 to-blue-100 px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_32%)]" />

      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#bfdbfe 1px, transparent 1px), linear-gradient(90deg, #bfdbfe 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative w-full max-w-md mx-auto">
        {/* Branding Section */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="relative group">
             <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <img
              src="/logo.jpg"
              alt="DMS ConnectHub Logo"
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-xl border-4 border-white"
            />
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-none mb-1">
              DMS<span className="text-blue-600">.</span>
            </h1>

            <p className="text-2xl sm:text-3xl font-light text-slate-700 leading-tight">
              Connect
              <span className="font-semibold text-blue-600">Hub</span>
            </p>

            <p className="mt-3 text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
              Document Repository
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full bg-white/90 backdrop-blur-3xl border border-white/60 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-blue-200/50">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>

            <p className="mt-1.5 text-slate-500 text-sm sm:text-base">
              Secure access to your corporate assets.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-2xl px-4 py-3.5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="font-bold mr-1">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
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
                className="w-full h-12 sm:h-14 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-4 sm:px-5 text-sm sm:text-base outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2.5 ml-1">
                <label htmlFor="password" className="block text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
                  Password
                </label>
              </div>

              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 sm:h-14 bg-slate-50/50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-2xl px-4 sm:px-5 pr-20 sm:pr-24 text-sm sm:text-base outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 px-3 rounded-xl text-[10px] sm:text-xs font-black text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all uppercase tracking-widest"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-14 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm sm:text-base shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center space-y-4">
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide uppercase">
            © {new Date().getFullYear()} <span className="text-slate-900 font-bold tracking-tight">DMS CONNECTHUB</span>
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Security</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}