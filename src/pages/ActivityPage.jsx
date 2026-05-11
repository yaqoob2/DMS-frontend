import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export default function ActivityPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 8;

    const loadActivities = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/activity");
            const data = res.data?.data || [];

            setActivities(data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            setError("Failed to load activity logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();
    }, []);

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const totalPages = Math.ceil(activities.length / itemsPerPage);

    const paginatedActivities = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return activities.slice(start, start + itemsPerPage);
    }, [activities, currentPage]);

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Initialising Activity Logs...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-7 bg-[#f8fafc] min-h-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-6 lg:mb-7">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-slate-900 leading-tight">
                            System <span className="text-blue-600">Activity</span>
                        </h1>

                        <p className="text-sm sm:text-base text-slate-500 font-medium">
                            Global audit trail for files, users, and repository events.
                        </p>
                    </div>

                    <button
                        onClick={loadActivities}
                        className="w-full sm:w-auto h-10 px-5 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                    >
                        Refresh Logs
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold mb-6 animate-in fade-in slide-in-from-top-2">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Activity List Card */}
            <section className="rounded-[24px] lg:rounded-[22px] border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-100 px-6 sm:px-7 lg:px-6 py-5 lg:py-4 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-lg font-black text-slate-900 tracking-tight">
                            Recent Events
                        </h2>

                        <p className="text-xs sm:text-sm lg:text-xs text-slate-400 font-semibold mt-0.5">
                            Showing {paginatedActivities.length} of {activities.length} entries
                        </p>
                    </div>

                    <div className="hidden sm:block">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Live Feed
                        </span>
                    </div>
                </div>

                {activities.length === 0 ? (
                    <div className="px-8 py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 grayscale opacity-40">
                            ⚡
                        </div>
                        <h3 className="text-slate-900 font-black text-lg mb-1">
                            Silence in the system
                        </h3>
                        <p className="text-slate-500 font-medium text-sm">
                            No activity recorded yet.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse min-w-[720px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-black">
                                        <th className="px-6 py-3 text-left">Action</th>
                                        <th className="px-6 py-3 text-left">Initiator</th>
                                        <th className="px-6 py-3 text-left">Description</th>
                                        <th className="px-6 py-3 text-left">Context</th>
                                        <th className="px-6 py-3 text-right">Timestamp</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {paginatedActivities.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="group hover:bg-slate-50/80 transition-all duration-200"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm transition-all group-hover:bg-blue-600 group-hover:text-white">
                                                        <span className="text-base">⚡</span>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none">
                                                            {item.action || "Generic Event"}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">
                                                            ID: {item._id?.slice(-6)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 border border-slate-200">
                                                        {(item.userId?.name || "S").charAt(0).toUpperCase()}
                                                    </div>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        {item.userId?.name || "System Process"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 max-w-[420px]">
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic line-clamp-2">
                                                    "{item.message || "No detailed log available."}"
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-colors">
                                                    {item.targetType || "System"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <p className="text-xs font-black text-slate-900 tracking-tight">
                                                    {formatDate(item.createdAt).split(",")[0]}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    {formatDate(item.createdAt).split(",")[1]}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile & Tablet Card List - kept same style */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {paginatedActivities.map((item) => (
                                <div
                                    key={item._id}
                                    className="p-6 hover:bg-slate-50 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            ⚡
                                        </div>

                                        <div className="min-w-0 flex-1 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                                                    {item.action || "Generic Event"}
                                                </h3>

                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[9px] font-black text-blue-700 uppercase tracking-widest">
                                                    {item.targetType || "System"}
                                                </span>
                                            </div>

                                            <p className="text-sm text-slate-600 font-medium leading-relaxed border-l-4 border-slate-100 pl-4 py-1 italic">
                                                {item.message || "No detailed log."}
                                            </p>

                                            <div className="pt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                                                        {(item.userId?.name || "S").charAt(0)}
                                                    </div>

                                                    <span className="text-[10px] font-bold text-slate-500">
                                                        {item.userId?.name || "System"}
                                                    </span>
                                                </div>

                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {formatDate(item.createdAt).split(",")[0]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-slate-100 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                                <p className="text-xs font-bold text-slate-500">
                                    Page {currentPage} of {totalPages}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="h-9 px-4 rounded-lg border border-slate-200 bg-slate-900 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}