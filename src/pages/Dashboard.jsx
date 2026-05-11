import { useEffect, useState } from "react";
import api from "../api/axios";
import { formatSize } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: 0,
    storageLimit: 0,
    usagePercentage: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [filesRes, foldersRes, storageRes] = await Promise.all([
        api.get("/files"),
        api.get("/folders"),
        api.get("/storage/summary"),
      ]);

      const files = filesRes.data?.files || filesRes.data?.data || [];
      const folders = foldersRes.data?.folders || foldersRes.data?.data || [];
      const storage = storageRes.data?.data || {};

      setSummary({
        totalFiles: files.length || filesRes.data?.count || 0,
        totalFolders: folders.length || foldersRes.data?.count || 0,
        storageUsed: storage.usedBytes || 0,
        storageLimit: storage.limitBytes || 0,
        usagePercentage: Number(storage.usagePercentage || 0),
      });
    } catch (error) {
      console.error("Failed to load dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 animate-pulse">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest">Initialising Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 overflow-x-hidden">
      {/* Welcome Header */}
      <section className="mb-8 lg:mb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Good day, <span className="text-blue-600">{user?.name?.split(' ')[0] || "User"}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Private Company Document Repository overview.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
              System Online
            </span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
        <DashboardCard
          title="Total Files"
          value={summary.totalFiles}
          subtitle="Active documents"
          icon="📄"
        />

        <DashboardCard
          title="Total Folders"
          value={summary.totalFolders}
          subtitle="Folder collections"
          icon="📁"
        />

        <DashboardCard
          title="Storage Used"
          value={formatSize(summary.storageUsed)}
          subtitle={`${summary.usagePercentage.toFixed(1)}% of ${formatSize(summary.storageLimit)}`}
          icon="☁️"
        />
      </section>

      {/* Storage Progress Section */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-16">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-3">
                Repository Storage
              </p>

              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">
                  {summary.usagePercentage.toFixed(1)}<span className="text-blue-600 text-3xl sm:text-4xl">%</span>
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed max-w-md">
              {formatSize(summary.storageUsed)} currently occupied out of {formatSize(summary.storageLimit)} allocated capacity.
            </p>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <div className="mb-4 flex items-end justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Usage Intensity</span>
              <span className={`text-sm font-bold ${summary.usagePercentage >= 90 ? 'text-red-600' : 'text-blue-600'}`}>
                {summary.usagePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-4 sm:h-5 w-full rounded-full bg-slate-100 overflow-hidden p-1 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                  summary.usagePercentage >= 95
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : summary.usagePercentage >= 80
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
                style={{
                  width: `${Math.max(summary.usagePercentage, summary.usagePercentage > 0 ? 2 : 0)}%`,
                }}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border-2 ${
                  summary.usagePercentage >= 95
                    ? "bg-red-50 text-red-700 border-red-100"
                    : summary.usagePercentage >= 80
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                }`}
              >
                {summary.usagePercentage >= 95
                  ? "Critical Status"
                  : summary.usagePercentage >= 80
                    ? "Warning Threshold"
                    : "Optimal Status"}
              </span>

              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest bg-slate-50 text-slate-600 border-2 border-slate-100">
                Auto-Cleanup Enabled
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({ title, value, subtitle, icon }) {
  return (
    <div className="group relative rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 overflow-hidden">
      <div className="absolute top-0 right-0 p-8 text-4xl sm:text-5xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0">
        {icon}
      </div>

      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
        {title}
      </p>

      <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
        {value}
      </h3>

      <p className="mt-2 text-xs sm:text-sm text-slate-500 font-semibold">
        {subtitle}
      </p>

      <div className="mt-6 h-1 w-12 rounded-full bg-slate-100 group-hover:w-full group-hover:bg-blue-600 transition-all duration-500" />
    </div>
  );
}