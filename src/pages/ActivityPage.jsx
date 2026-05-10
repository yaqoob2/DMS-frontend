import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ActivityPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadActivities = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/activity");
            const data = res.data?.data || [];

            setActivities(data);
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
        return new Date(value).toLocaleString();
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Activity</h1>
                <p className="mt-4 text-slate-500">Loading activity logs...</p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-[1500px] mx-auto bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
                    Activity
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    View global file, folder, user, and system activity logs.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 mb-5">
                    {error}
                </div>
            )}

            {/* Activity Table */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Recent Activity
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {activities.length} activity logs
                        </p>
                    </div>
                </div>

                {activities.length === 0 ? (
                    <div className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-xl mb-3">
                                ⚡
                            </div>

                            <p className="text-[13px] font-semibold text-slate-700">
                                No activity logs found
                            </p>

                            <p className="text-[12px] text-slate-400 mt-1">
                                System activity will appear here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                    <th className="px-5 py-3 text-left font-bold">
                                        Action
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        User
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Details
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Target
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {activities.map((item) => (
                                    <tr
                                        key={item._id}
                                        className="hover:bg-slate-50 transition-all"
                                    >
                                        {/* Action */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-sm">
                                                    ⚡
                                                </div>

                                                <div>
                                                    <p className="text-[13px] font-semibold text-slate-800">
                                                        {item.action || "-"}
                                                    </p>

                                                    <p className="text-[11px] text-slate-400 mt-1">
                                                        System Activity
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-700">
                                                    {item.userId?.name || "-"}
                                                </p>

                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    User
                                                </p>
                                            </div>
                                        </td>

                                        {/* Details */}
                                        <td className="px-5 py-4 max-w-[420px]">
                                            <p className="text-[12px] text-slate-600 leading-relaxed">
                                                {item.message || "-"}
                                            </p>
                                        </td>

                                        {/* Target */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                {item.targetType || "-"}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-[12px] text-slate-500">
                                                {formatDate(item.createdAt)}
                                            </p>
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