import { useEffect, useState } from "react";
import api from "../api/axios";

export default function StorageDashboard() {
    const [summary, setSummary] = useState(null);
    const [largestFiles, setLargestFiles] = useState([]);
    const [monthlyActivity, setMonthlyActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Calculating System Metrics...</p>
            </div>
        );
    }

    const used = summary?.usedBytes || 0;
    const limit = summary?.limitBytes || 0;
    const remaining = summary?.remainingBytes || 0;
    const percentage = Number(summary?.usagePercentage || 0);
    const status = summary?.status || "OPTIMAL";

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-[#f8fafc] min-h-full overflow-x-hidden">
            {/* Header Section */}
            <div className="mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    System <span className="text-blue-600">Metrics</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
                    Monitor real-time storage allocation, payload distribution, and archive activity.
                </p>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-xs sm:text-sm text-red-600 font-bold mb-8 animate-in fade-in slide-in-from-top-4">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Storage Summary Section */}
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/40 mb-8 lg:mb-12 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                    {/* Left: Raw Data */}
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                            Storage Allocation
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-2">
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                                {formatSize(used).split(' ')[0]}
                                <span className="text-xl sm:text-2xl text-slate-400 ml-1 font-bold">
                                    {formatSize(used).split(' ')[1]}
                                </span>
                            </h2>
                            <div className="h-6 w-px bg-slate-200 hidden sm:block mb-1"></div>
                            <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">
                                of {formatSize(limit)} Total Capacity
                            </p>
                        </div>

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Available Buffer: <span className="text-slate-900">{formatSize(remaining)}</span>
                        </p>
                    </div>

                    {/* Right: Visual Progress */}
                    <div className="w-full lg:w-[400px]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                                Sector Usage
                            </span>

                            <span className="text-xl font-black text-slate-900">
                                {percentage.toFixed(1)}%
                            </span>
                        </div>

                        <div className="h-4 w-full rounded-full bg-slate-100 p-1 shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${percentage >= 95
                                        ? "bg-red-600 shadow-red-500/30"
                                        : percentage >= 80
                                            ? "bg-yellow-500 shadow-yellow-500/30"
                                            : "bg-blue-600 shadow-blue-500/30"
                                    }`}
                                style={{
                                    width: `${Math.max(
                                        Math.min(percentage, 100),
                                        percentage > 0 ? 2 : 0
                                    )}%`,
                                }}
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <span
                                className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${percentage >= 95
                                        ? "bg-red-50 text-red-700 border-red-100"
                                        : percentage >= 80
                                            ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                            : "bg-blue-50 text-blue-700 border-blue-100"
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${percentage >= 95 ? "bg-red-600" : percentage >= 80 ? "bg-yellow-600" : "bg-blue-600"}`}></span>
                                SYSTEM {status.toUpperCase()}
                            </span>
                            
                            <button 
                                onClick={loadStorageData}
                                className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                            >
                                Refresh Sync
                            </button>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -ml-32 -mb-32"></div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                {/* Largest Files Section */}
                <section className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Payload Distribution
                        </h2>
                        <p className="text-[14px] font-black text-slate-900 mt-1">High-Consumption Assets</p>
                    </div>

                    {largestFiles.length === 0 ? (
                        <div className="px-8 py-16 text-center">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No assets identified.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 text-[9px] uppercase tracking-[0.25em] text-slate-400 font-black border-b border-slate-50">
                                        <th className="px-8 py-4 text-left">Asset Identity</th>
                                        <th className="px-8 py-4 text-left">Payload</th>
                                        <th className="px-8 py-4 text-right">Epoch</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-50">
                                    {largestFiles.map((file) => (
                                        <tr
                                            key={file._id}
                                            className="group hover:bg-slate-50/50 transition-all duration-300"
                                        >
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-500">
                                                        📄
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-black text-slate-900 truncate max-w-[200px]">
                                                            {file.originalName || file.name || "UNNAMED"}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                            FILE ID: {String(file._id).slice(-6).toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-8 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                {formatSize(file.size)}
                                            </td>

                                            <td className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Monthly Activity Section */}
                <section className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40">
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            System Throughput
                        </h2>
                        <p className="text-[14px] font-black text-slate-900 mt-1">Operational Flux (Monthly)</p>
                    </div>

                    {monthlyActivity.length === 0 ? (
                        <div className="px-8 py-16 text-center">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No activity logged.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 text-[9px] uppercase tracking-[0.25em] text-slate-400 font-black border-b border-slate-50">
                                        <th className="px-8 py-4 text-left">Temporal Node</th>
                                        <th className="px-8 py-4 text-left">Ingress</th>
                                        <th className="px-8 py-4 text-left">Egress</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-50">
                                    {monthlyActivity.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="group hover:bg-slate-50/50 transition-all duration-300"
                                        >
                                            <td className="px-8 py-4">
                                                <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
                                                    {item.month || item._id || "UNKNOWN"}
                                                </p>
                                            </td>

                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                                                        {item.uploads || 0} UPLOADS
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                                        {item.downloads || 0} DOWNLOADS
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}