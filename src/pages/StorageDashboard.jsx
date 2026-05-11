import { useEffect, useState } from "react";
import api from "../api/axios";

export default function StorageDashboard() {
    const [summary, setSummary] = useState(null);
    const [largestFiles, setLargestFiles] = useState([]);
    const [monthlyActivity, setMonthlyActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const visibleFilesLimit = 3;

    const formatSize = (bytes) => {
        if (!bytes && bytes !== 0) return "-";
        const kb = bytes / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        if (kb >= 1) return `${kb.toFixed(2)} KB`;
        return `${bytes} B`;
    };

    const loadStorageData = async () => {
        try {
            setLoading(true);
            setError("");

            const [summaryRes, largestRes, activityRes] = await Promise.all([
                api.get("/storage/summary"),
                api.get("/storage/largest-files"),
                api.get("/storage/monthly-activity"),
            ]);

            setSummary(summaryRes.data?.data || summaryRes.data);
            setLargestFiles(largestRes.data?.data || largestRes.data || []);
            setMonthlyActivity(activityRes.data?.data || activityRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load repository metrics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStorageData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Calculating System Metrics...
                </p>
            </div>
        );
    }

    const used = summary?.usedBytes || 0;
    const limit = summary?.limitBytes || 0;
    const remaining = summary?.remainingBytes || 0;
    const percentage = Number(summary?.usagePercentage || 0);
    const status = summary?.status || "OPTIMAL";
    const visibleFiles = largestFiles.slice(0, visibleFilesLimit);

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-6 py-6 lg:py-5 bg-[#f8fafc] min-h-full overflow-x-hidden">
            <div className="mb-6 lg:mb-5">
                <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-black tracking-tight text-slate-900 leading-tight">
                    System <span className="text-blue-600">Metrics</span>
                </h1>

                <p className="mt-1 text-sm text-slate-500 font-medium">
                    Monitor storage usage, largest files, and monthly activity.
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-bold mb-5">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <section className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm mb-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                            Storage Usage
                        </p>

                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-black text-slate-900 leading-none">
                                {formatSize(used).split(" ")[0]}
                                <span className="text-lg text-slate-400 ml-1">
                                    {formatSize(used).split(" ")[1]}
                                </span>
                            </h2>

                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">
                                / {formatSize(limit)}
                            </p>
                        </div>

                        <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                            Remaining:{" "}
                            <span className="text-slate-900">{formatSize(remaining)}</span>
                        </p>
                    </div>

                    <div className="w-full lg:w-[320px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                Usage
                            </span>

                            <span className="text-base font-black text-slate-900">
                                {percentage.toFixed(1)}%
                            </span>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${percentage >= 95
                                        ? "bg-red-600"
                                        : percentage >= 80
                                            ? "bg-yellow-500"
                                            : "bg-blue-600"
                                    }`}
                                style={{
                                    width: `${Math.max(
                                        Math.min(percentage, 100),
                                        percentage > 0 ? 2 : 0
                                    )}%`,
                                }}
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                                System {status.toUpperCase()}
                            </span>

                            <button
                                onClick={loadStorageData}
                                className="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <section className="rounded-[18px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-900">
                            Largest Files
                        </h2>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            Showing top {visibleFiles.length}
                        </p>
                    </div>

                    {visibleFiles.length === 0 ? (
                        <div className="px-5 py-10 text-center text-slate-400 font-bold text-sm">
                            No files found.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {visibleFiles.map((file) => (
                                <div
                                    key={file._id}
                                    className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-sm">
                                            📄
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 truncate max-w-[220px]">
                                                {file.originalName || file.name || "Unnamed file"}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                ID: {String(file._id).slice(-6).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-black text-slate-700">
                                            {formatSize(file.size)}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                            {file.createdAt
                                                ? new Date(file.createdAt).toLocaleDateString()
                                                : "-"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-900">
                            Monthly Activity
                        </h2>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            Upload and download summary
                        </p>
                    </div>

                    {monthlyActivity.length === 0 ? (
                        <div className="px-5 py-10 text-center text-slate-400 font-bold text-sm">
                            No activity logged.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {monthlyActivity.slice(0, 3).map((item, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                                >
                                    <div>
                                        <p className="text-sm font-black text-slate-900">
                                            {item.month || item._id || "Unknown"}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                            Monthly repository movement
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 text-right">
                                        <div>
                                            <p className="text-xs font-black text-blue-600">
                                                {item.uploads || 0}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                                                Uploads
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-black text-slate-700">
                                                {item.downloads || 0}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                                                Downloads
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}