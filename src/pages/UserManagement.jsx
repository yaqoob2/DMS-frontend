import { useEffect, useState } from "react";
import api from "../api/axios";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "owner",
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/users");
            setUsers(res.data?.users || res.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load user database.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const createUser = async (e) => {
        e.preventDefault();

        try {
            setError("");

            await api.post("/users", form);

            setForm({
                name: "",
                email: "",
                password: "",
                role: "owner",
            });

            await loadUsers();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create user account.");
        }
    };

    const toggleStatus = async (user) => {
        try {
            setSavingId(user._id);

            await api.patch(`/users/${user._id}/status`, {
                isActive: !user.isActive,
            });

            await loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update user status.");
        } finally {
            setSavingId(null);
        }
    };

    const changeRole = async (user, role) => {
        try {
            setSavingId(user._id);

            await api.patch(`/users/${user._id}/role`, {
                role,
            });

            await loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to update user role.");
        } finally {
            setSavingId(null);
        }
    };

    const deleteUser = async (userId) => {
        const confirmed = window.confirm("Permanently delete this user? This action is audited.");
        if (!confirmed) return;

        try {
            setSavingId(userId);

            await api.delete(`/users/${userId}`);
            await loadUsers();
        } catch (err) {
            console.error(err);
            alert("Failed to delete user.");
        } finally {
            setSavingId(null);
        }
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString();
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Initialising Personnel Database...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-[#f8fafc] min-h-full overflow-x-hidden">
            {/* Header Section */}
            <div className="mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    Personnel <span className="text-blue-600">Control</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
                    Manage repository custodians, administrative roles, and access protocols.
                </p>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-xs sm:text-sm text-red-600 font-bold mb-8 animate-in fade-in slide-in-from-top-4">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Create User Section */}
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/40 mb-8 lg:mb-12">
                <div className="mb-8">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Deploy <span className="text-blue-600">New Custodian</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Authorise new repository access credentials.
                    </p>
                </div>

                <form
                    onSubmit={createUser}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6"
                >
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                        <input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="John Doe"
                            required
                            className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                        <input
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            placeholder="john@company.com"
                            type="email"
                            required
                            className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Access Password</label>
                        <input
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            placeholder="••••••••"
                            type="password"
                            required
                            className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Role</label>
                        <select
                            value={form.role}
                            onChange={(e) =>
                                setForm({ ...form, role: e.target.value })
                            }
                            className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                        >
                            <option value="owner">Owner</option>
                            <option value="member">Member</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full h-14 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 active:scale-95"
                        >
                            Deploy Account
                        </button>
                    </div>
                </form>
            </section>

            {/* Users Database Listing */}
            <section className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div>
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            Authorised Personnel
                        </h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {users.length} Active Credentials
                    </span>
                </div>

                {users.length === 0 ? (
                    <div className="px-8 py-20 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                            No custodians found in system memory.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Data Grid */}
                        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black border-b border-slate-50">
                                        <th className="px-8 py-5 text-left">Identity</th>
                                        <th className="px-8 py-5 text-left">Endpoint</th>
                                        <th className="px-8 py-5 text-left">Clearance Level</th>
                                        <th className="px-8 py-5 text-left">Access Status</th>
                                        <th className="px-8 py-5 text-left">Deployment Epoch</th>
                                        <th className="px-8 py-5 text-right">Operations</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-50">
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="group hover:bg-slate-50/50 transition-all duration-300"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[13px] font-black text-blue-600 shadow-sm group-hover:scale-110 transition-all duration-500">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-black text-slate-900 tracking-tight">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                            Verified Custodian
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-8 py-5 text-[12px] font-bold text-slate-600 italic">
                                                {user.email}
                                            </td>

                                            <td className="px-8 py-5">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) =>
                                                        changeRole(user, e.target.value)
                                                    }
                                                    disabled={savingId === user._id}
                                                    className="h-10 px-4 rounded-xl border border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-slate-50"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="member">Member</option>
                                                    <option value="superadmin">Superadmin</option>
                                                </select>
                                            </td>

                                            <td className="px-8 py-5">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            : "bg-red-50 text-red-700 border-red-100"
                                                        }`}
                                                >
                                                    {user.isActive
                                                        ? "Operational"
                                                        : "Restricted"}
                                                </span>
                                            </td>

                                            <td className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                                {formatDate(user.createdAt).split(',')[0]}
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => toggleStatus(user)}
                                                        disabled={savingId === user._id}
                                                        className="h-10 px-5 rounded-xl border border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm"
                                                    >
                                                        {user.isActive
                                                            ? "Revoke"
                                                            : "Restore"}
                                                    </button>

                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        disabled={savingId === user._id}
                                                        className="h-10 px-5 rounded-xl bg-red-50 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                                    >
                                                        Purge
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Tactical View (Cards) */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {users.map((user) => (
                                <div key={user._id} className="p-6 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-lg font-black text-white shadow-xl shadow-blue-500/20">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-slate-900 leading-tight truncate">{user.name}</h3>
                                                <p className="text-[11px] font-bold text-slate-500 mt-1 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${user.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-red-50 text-red-700 border-red-100"
                                                }`}
                                        >
                                            {user.isActive ? "ACTIVE" : "RESTRICTED"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clearance</p>
                                            <select
                                                value={user.role}
                                                onChange={(e) => changeRole(user, e.target.value)}
                                                disabled={savingId === user._id}
                                                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none focus:border-blue-500 transition-all"
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="member">Member</option>
                                                <option value="superadmin">Superadmin</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Epoch</p>
                                            <p className="text-[11px] text-slate-900 font-black uppercase tracking-widest py-2.5 px-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleStatus(user)}
                                            disabled={savingId === user._id}
                                            className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 active:bg-slate-900 active:text-white transition-all shadow-sm"
                                        >
                                            {user.isActive ? "REVOKE ACCESS" : "RESTORE ACCESS"}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            disabled={savingId === user._id}
                                            className="flex-1 h-12 rounded-2xl bg-red-50 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 active:bg-red-600 active:text-white transition-all shadow-sm"
                                        >
                                            PURGE ACCOUNT
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}