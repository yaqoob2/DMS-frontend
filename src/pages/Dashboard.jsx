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
      const [filesRes, foldersRes, storageRes] =
        await Promise.all([
          api.get("/files"),
          api.get("/folders"),
          api.get("/storage/summary"),
        ]);

      const files =
        filesRes.data?.files ||
        filesRes.data?.data ||
        [];

      const folders =
        foldersRes.data?.folders ||
        foldersRes.data?.data ||
        [];

      const storage =
        storageRes.data?.data || {};

      setSummary({
        totalFiles:
          files.length ||
          filesRes.data?.count ||
          0,

        totalFolders:
          folders.length ||
          foldersRes.data?.count ||
          0,

        storageUsed:
          storage.usedBytes || 0,

        storageLimit:
          storage.limitBytes || 0,

        usagePercentage: Number(
          storage.usagePercentage || 0
        ),
      });
    } catch (error) {
      console.error(
        "Failed to load dashboard summary:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-[13px] text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] p-5 max-w-[1500px] mx-auto">
      {/* Header */}
      <section className="mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
              Good day, {user?.name}
            </h1>

            <p className="mt-1 text-[13px] text-slate-500">
              Private Company Document Repository overview.
            </p>
          </div>

          <div className="rounded-md border border-emerald-100 bg-emerald-50 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />

              <span className="text-[12px] font-semibold text-emerald-700">
                System Online
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <DashboardCard
          title="Total Files"
          value={summary.totalFiles}
          subtitle="Active documents"
        />

        <DashboardCard
          title="Total Folders"
          value={summary.totalFolders}
          subtitle="Folder collections"
        />

        <DashboardCard
          title="Storage Used"
          value={formatSize(summary.storageUsed)}
          subtitle={`${summary.usagePercentage.toFixed(
            2
          )}% of ${formatSize(
            summary.storageLimit
          )}`}
        />
      </section>

      {/* Storage */}
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-bold mb-2">
              Repository Storage
            </p>

            <h2 className="text-[28px] font-bold text-slate-900">
              {summary.usagePercentage.toFixed(2)}%
            </h2>

            <p className="mt-1 text-[13px] text-slate-500">
              {formatSize(summary.storageUsed)} used
              from{" "}
              {formatSize(summary.storageLimit)}
            </p>
          </div>

          <div className="min-w-[260px]">
            <div className="mb-2 flex justify-between text-[12px]">
              <span className="font-semibold text-slate-600">
                Usage
              </span>

              <span className="text-slate-500">
                {summary.usagePercentage.toFixed(
                  2
                )}
                %
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${summary.usagePercentage >= 95
                    ? "bg-red-600"
                    : summary.usagePercentage >= 80
                      ? "bg-yellow-500"
                      : "bg-blue-600"
                  }`}
                style={{
                  width: `${Math.max(
                    Math.min(
                      summary.usagePercentage,
                      100
                    ),
                    summary.usagePercentage > 0
                      ? 1
                      : 0
                  )}%`,
                }}
              />
            </div>

            <div className="mt-3">
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold border ${summary.usagePercentage >= 95
                    ? "bg-red-50 text-red-700 border-red-100"
                    : summary.usagePercentage >=
                      80
                      ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}
              >
                {summary.usagePercentage >= 95
                  ? "Critical Usage"
                  : summary.usagePercentage >=
                    80
                    ? "Warning Usage"
                    : "Healthy Usage"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-[28px] font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-2 text-[12px] text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}