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
            setError("Failed to load storage dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStorageData();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Storage</h1>
                <p className="mt-4 text-slate-500">Loading storage data...</p>
            </div>
        );
    }

    const used = summary?.usedBytes || 0;
    const limit = summary?.limitBytes || 0;
    const remaining = summary?.remainingBytes || 0;
    const percentage = Number(summary?.usagePercentage || 0);
    const status = summary?.status || "normal";
    return (
        <div className="p-5 max-w-[1500px] mx-auto bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
                    Storage Dashboard
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    Monitor storage usage, largest files, and monthly repository activity.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 mb-5">
                    {error}
                </div>
            )}

            {/* Storage Summary */}
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left */}
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-bold mb-2">
                            Storage Usage
                        </p>

                        <h2 className="text-[28px] font-bold text-slate-900">
                            {formatSize(used)}
                        </h2>

                        <p className="mt-1 text-[13px] text-slate-500">
                            of {formatSize(limit)} used
                        </p>

                        <p className="mt-2 text-[12px] text-slate-400">
                            Remaining: {formatSize(remaining)}
                        </p>
                    </div>

                    {/* Right */}
                    <div className="min-w-[220px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
                                Usage
                            </span>

                            <span className="text-[14px] font-bold text-slate-900">
                                {percentage.toFixed(2)}%
                            </span>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${percentage >= 95
                                        ? "bg-red-600"
                                        : percentage >= 80
                                            ? "bg-yellow-500"
                                            : "bg-blue-600"
                                    }`}
                                style={{
                                    width: `${Math.max(
                                        Math.min(percentage, 100),
                                        percentage > 0 ? 1 : 0
                                    )}%`,
                                }}
                            />
                        </div>

                        <div className="mt-3">
                            <span
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold border ${percentage >= 95
                                        ? "bg-red-50 text-red-700 border-red-100"
                                        : percentage >= 80
                                            ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                            : "bg-blue-50 text-blue-700 border-blue-100"
                                    }`}
                            >
                                {status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {percentage >= 95 && (
                    <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
                        Storage usage is above 95%. Uploads may be restricted soon.
                    </div>
                )}

                {percentage >= 80 && percentage < 95 && (
                    <div className="mt-5 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-[12px] text-yellow-700">
                        Storage usage has exceeded 80%.
                    </div>
                )}
            </section>

            {/* Largest Files */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm mb-6">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Largest Files
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            Top storage-consuming documents
                        </p>
                    </div>
                </div>

                {largestFiles.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No files found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                    <th className="px-5 py-3 text-left font-bold">
                                        File Name
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Size
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Uploaded
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {largestFiles.map((file) => (
                                    <tr
                                        key={file._id}
                                        className="hover:bg-slate-50 transition-all"
                                    >
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-800">
                                                    {file.originalName ||
                                                        file.name ||
                                                        file.fileName ||
                                                        "Untitled file"}
                                                </p>

                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    Document
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-[12px] text-slate-600">
                                            {formatSize(file.size)}
                                        </td>

                                        <td className="px-5 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                                            {file.createdAt
                                                ? new Date(
                                                    file.createdAt
                                                ).toLocaleString()
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Monthly Activity */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Monthly Activity
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            Upload and download statistics
                        </p>
                    </div>
                </div>

                {monthlyActivity.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No monthly activity found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                    <th className="px-5 py-3 text-left font-bold">
                                        Month
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Uploads
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Downloads
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {monthlyActivity.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-50 transition-all"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="text-[13px] font-semibold text-slate-800">
                                                {item.month || item._id || "-"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                                {item.uploads || 0}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                {item.downloads || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}