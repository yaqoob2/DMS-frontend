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
            setError("Failed to load users.");
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
            setError(err.response?.data?.message || "Failed to create user.");
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
        const confirmed = window.confirm("Are you sure you want to delete this user?");
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
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
                <p className="mt-4 text-slate-500">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-[1500px] mx-auto bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
                    User Management
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    Manage DocRepo owners, members, roles, and access status.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 mb-5">
                    {error}
                </div>
            )}

            {/* Create User */}
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Create User
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            Add a new owner, member, or superadmin.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={createUser}
                    className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-5"
                >
                    <input
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Name"
                        required
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        placeholder="Email"
                        type="email"
                        required
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                        value={form.password}
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                        placeholder="Password"
                        type="password"
                        required
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <select
                        value={form.role}
                        onChange={(e) =>
                            setForm({ ...form, role: e.target.value })
                        }
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="owner">Owner</option>
                        <option value="member">Member</option>
                        <option value="superadmin">Superadmin</option>
                    </select>

                    <button
                        type="submit"
                        className="h-10 rounded-md bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-all"
                    >
                        Create User
                    </button>
                </form>
            </section>

            {/* Users Table / Cards */}
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Users
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {users.length} total users
                        </p>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500 text-center">
                        No users found.
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                        <th className="px-5 py-3 text-left font-bold">
                                            Name
                                        </th>

                                        <th className="px-5 py-3 text-left font-bold">
                                            Email
                                        </th>

                                        <th className="px-5 py-3 text-left font-bold">
                                            Role
                                        </th>

                                        <th className="px-5 py-3 text-left font-bold">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-left font-bold">
                                            Created
                                        </th>

                                        <th className="px-5 py-3 text-right font-bold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-slate-50 transition-all"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-slate-800">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            User Account
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-[12px] text-slate-600">
                                                {user.email}
                                            </td>

                                            <td className="px-5 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) =>
                                                        changeRole(user, e.target.value)
                                                    }
                                                    disabled={savingId === user._id}
                                                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] outline-none focus:border-blue-500 transition-colors"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="member">Member</option>
                                                    <option value="superadmin">
                                                        Superadmin
                                                    </option>
                                                </select>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold border ${user.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            : "bg-red-50 text-red-700 border-red-100"
                                                        }`}
                                                >
                                                    {user.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleStatus(user)}
                                                        disabled={savingId === user._id}
                                                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 transition-all"
                                                    >
                                                        {user.isActive
                                                            ? "Deactivate"
                                                            : "Activate"}
                                                    </button>

                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        disabled={savingId === user._id}
                                                        className="h-9 px-3 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60 transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List */}
                        <div className="lg:hidden divide-y divide-slate-100">
                            {users.map((user) => (
                                <div key={user._id} className="p-4 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-[14px] font-bold text-slate-900">{user.name}</h3>
                                                <p className="text-[12px] text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${user.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-red-50 text-red-700 border-red-100"
                                                }`}
                                        >
                                            {user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Role</p>
                                            <select
                                                value={user.role}
                                                onChange={(e) => changeRole(user, e.target.value)}
                                                disabled={savingId === user._id}
                                                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-[12px] outline-none"
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="member">Member</option>
                                                <option value="superadmin">Superadmin</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Created At</p>
                                            <p className="text-[12px] text-slate-600 font-medium py-2">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1">
                                        <button
                                            onClick={() => toggleStatus(user)}
                                            disabled={savingId === user._id}
                                            className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 active:bg-slate-50 transition-colors"
                                        >
                                            {user.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user._id)}
                                            disabled={savingId === user._id}
                                            className="flex-1 h-10 rounded-xl bg-red-50 text-[12px] font-bold text-red-600 active:bg-red-100 transition-colors"
                                        >
                                            Delete User
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