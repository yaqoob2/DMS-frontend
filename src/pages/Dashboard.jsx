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
      <div className="px-4 py-10 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Welcome back,{" "}
              <span className="text-blue-600">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor your company repository and storage usage.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-emerald-200 bg-emerald-50">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              System Online
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        <DashboardCard
          title="Total Files"
          value={summary.totalFiles}
          subtitle="Active documents"
        />

        <DashboardCard
          title="Folders"
          value={summary.totalFolders}
          subtitle="Repository folders"
        />

        <DashboardCard
          title="Storage Used"
          value={formatSize(summary.storageUsed)}
          subtitle={`${summary.usagePercentage.toFixed(1)}% of ${formatSize(summary.storageLimit)}`}
        />
      </section>

      {/* Storage Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 mb-3">
              Storage Usage
            </p>

            <div className="flex items-end gap-2">
              <h2 className="text-5xl font-bold tracking-tight text-slate-900">
                {summary.usagePercentage.toFixed(1)}
              </h2>

              <span className="text-2xl font-bold text-blue-600 mb-1">
                %
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-md">
              {formatSize(summary.storageUsed)} used from{" "}
              {formatSize(summary.storageLimit)} total storage capacity.
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Usage Progress
              </span>

              <span
                className={`text-sm font-semibold ${summary.usagePercentage >= 90
                    ? "text-red-600"
                    : "text-blue-600"
                  }`}
              >
                {summary.usagePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${summary.usagePercentage >= 95
                    ? "bg-red-500"
                    : summary.usagePercentage >= 80
                      ? "bg-amber-500"
                      : "bg-blue-600"
                  }`}
                style={{
                  width: `${Math.max(
                    summary.usagePercentage,
                    summary.usagePercentage > 0 ? 2 : 0
                  )}%`,
                }}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${summary.usagePercentage >= 95
                    ? "bg-red-50 text-red-700 border-red-200"
                    : summary.usagePercentage >= 80
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
              >
                {summary.usagePercentage >= 95
                  ? "Critical"
                  : summary.usagePercentage >= 80
                    ? "Warning"
                    : "Healthy"}
              </span>

              <span className="px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-600">
                Auto Cleanup Enabled
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>

      <h3 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}