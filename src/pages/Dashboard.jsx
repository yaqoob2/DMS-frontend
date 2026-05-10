import { useEffect, useState } from 'react';
import { storageService } from '../api/services';
import { formatSize } from '../utils/formatters';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: 0,
    storageLimit: 10 * 1024 * 1024 * 1024,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await storageService.getSummary();
      const data = res.data || res;

      setSummary({
        totalFiles: data.totalFiles || 0,
        totalFolders: data.totalFolders || 0,
        storageUsed: data.storageUsed || 0,
        storageLimit: data.storageLimit || 10 * 1024 * 1024 * 1024,
      });
    } catch (error) {
      console.error('Failed to load dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const storagePercent =
    summary.storageLimit > 0
      ? Math.round((summary.storageUsed / summary.storageLimit) * 100)
      : 0;

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-100 min-h-full">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">
          Good day, Yaqoob!
        </h1>
        <p className="text-slate-500 mt-2">
          Welcome to the Private Company Document Repository.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Files"
          value={summary.totalFiles}
          subtitle="Active documents"
          icon="file"
          color="blue"
        />

        <DashboardCard
          title="Total Folders"
          value={summary.totalFolders}
          subtitle="Organized collections"
          icon="folder"
          color="indigo"
        />

        <DashboardCard
          title="Storage Used"
          value={formatSize(summary.storageUsed)}
          subtitle={`Used of ${formatSize(summary.storageLimit)}`}
          icon="storage"
          color="amber"
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Repository Status
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Your document repository is online and ready.
            </p>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Online
          </span>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Storage Usage</span>
            <span className="text-slate-500">{storagePercent}%</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${storagePercent >= 95
                  ? 'bg-red-500'
                  : storagePercent >= 80
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            ></div>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {formatSize(summary.storageUsed)} used from{' '}
            {formatSize(summary.storageLimit)} available storage.
          </p>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({ title, value, subtitle, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
      >
        {icon === 'file' && (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}

        {icon === 'folder' && (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        )}

        {icon === 'storage' && (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7c0 1.657 3.582 3 8 3s8-1.343 8-3-3.582-3-8-3-8 1.343-8 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.657 3.582 3 8 3s8-1.343 8-3V7" />
          </svg>
        )}
      </div>

      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-6">
        {title}
      </p>

      <h3 className="text-3xl font-bold text-slate-900 mt-2">
        {value}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {subtitle}
      </p>
    </div>
  );
}