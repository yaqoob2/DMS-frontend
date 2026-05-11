import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FolderPermissions() {
    const [folders, setFolders] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        userId: "",
        access: "view",
    });

    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [foldersRes, usersRes] = await Promise.all([
                api.get("/folders"),
                api.get("/users/permission-options"),
            ]);

            const foldersData =
                foldersRes.data?.folders ||
                foldersRes.data?.data ||
                [];

            const usersData =
                usersRes.data?.users ||
                usersRes.data?.data ||
                [];

            setFolders(foldersData);
            setUsers(usersData);

            if (foldersData.length > 0) {
                setSelectedFolder(foldersData[0]._id);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load folders/users.");
        } finally {
            setLoading(false);
        }
    };

    const loadPermissions = async (folderId) => {
        if (!folderId) return;

        try {
            const res = await api.get(`/folders/${folderId}/permissions`);

            setPermissions(
                res.data?.permissions ||
                res.data?.data ||
                []
            );
        } catch (err) {
            console.error(err);
            setPermissions([]);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedFolder) {
            loadPermissions(selectedFolder);
        }
    }, [selectedFolder]);

    const addPermission = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            await api.post("/permissions", {
                folderId: selectedFolder,
                userId: form.userId,
                access: form.access,
            });

            setForm({
                userId: "",
                access: "view",
            });

            await loadPermissions(selectedFolder);
        } catch (err) {
            console.error(err);
            alert("Failed to add permission.");
        } finally {
            setSaving(false);
        }
    };

    const updatePermission = async (permissionId, access) => {
        try {
            setSaving(true);

            await api.patch(`/permissions/${permissionId}`, {
                access,
            });

            await loadPermissions(selectedFolder);
        } catch (err) {
            console.error(err);
            alert("Failed to update permission.");
        } finally {
            setSaving(false);
        }
    };

    const deletePermission = async (permissionId) => {
        const confirmed = window.confirm("Remove this permission?");

        if (!confirmed) return;

        try {
            setSaving(true);

            await api.delete(`/permissions/${permissionId}`);

            await loadPermissions(selectedFolder);
        } catch (err) {
            console.error(err);
            alert("Failed to remove permission.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Initialising Permissions...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-6 py-6 lg:py-6 bg-slate-50 min-h-full overflow-x-hidden">
            <div className="mb-8 lg:mb-7">
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black lg:font-bold tracking-tight text-slate-900 leading-tight">
                    Folder <span className="text-blue-600">Permissions</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base lg:text-sm text-slate-500 font-medium">
                    Manage folder access, user permissions, and security roles.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl lg:rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 lg:py-3 text-sm text-red-700 font-bold lg:font-semibold mb-8 lg:mb-6 animate-in fade-in slide-in-from-top-2">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <section className="rounded-[32px] lg:rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-6 shadow-xl lg:shadow-sm shadow-slate-200/40 mb-8 lg:mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-5">
                    <div className="lg:col-span-4 space-y-4 lg:space-y-3">
                        <div>
                            <label className="block text-[11px] lg:text-xs font-black lg:font-semibold uppercase tracking-[0.2em] lg:tracking-wide text-slate-400 mb-3 lg:mb-2 ml-1">
                                Target Folder
                            </label>

                            <div className="relative group">
                                <select
                                    value={selectedFolder}
                                    onChange={(e) =>
                                        setSelectedFolder(e.target.value)
                                    }
                                    className="w-full h-12 sm:h-14 lg:h-10 rounded-2xl lg:rounded-lg border border-slate-200 bg-slate-50/50 px-4 lg:px-3 text-sm sm:text-base lg:text-sm font-bold lg:font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                                >
                                    {folders.map((folder) => (
                                        <option
                                            key={folder._id}
                                            value={folder._id}
                                        >
                                            {folder.path || folder.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 lg:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-600 transition-colors text-sm">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="p-4 lg:p-3 rounded-2xl lg:rounded-lg bg-blue-50 border border-blue-100">
                            <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                                Select a folder to view and manage its current access list.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <label className="block text-[11px] lg:text-xs font-black lg:font-semibold uppercase tracking-[0.2em] lg:tracking-wide text-slate-400 mb-3 lg:mb-2 ml-1">
                            Add Access
                        </label>

                        <form
                            onSubmit={addPermission}
                            className="flex flex-col sm:flex-row gap-4 lg:gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <select
                                    value={form.userId}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            userId: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full h-12 sm:h-14 lg:h-10 rounded-2xl lg:rounded-lg border border-slate-200 bg-slate-50/50 px-4 lg:px-3 text-sm sm:text-base lg:text-sm font-bold lg:font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                >
                                    <option value="">Select User</option>

                                    {users.map((user) => (
                                        <option
                                            key={user._id}
                                            value={user._id}
                                        >
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full sm:w-40 lg:w-36">
                                <select
                                    value={form.access}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            access: e.target.value,
                                        })
                                    }
                                    className="w-full h-12 sm:h-14 lg:h-10 rounded-2xl lg:rounded-lg border border-slate-200 bg-slate-50/50 px-4 lg:px-3 text-sm sm:text-base lg:text-sm font-bold lg:font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                >
                                    <option value="view">View Only</option>
                                    <option value="edit">Edit Access</option>
                                    <option value="admin">Full Admin</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="h-12 sm:h-14 lg:h-10 px-8 lg:px-5 rounded-2xl lg:rounded-lg bg-blue-600 text-white text-sm sm:text-base lg:text-sm font-black lg:font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg lg:shadow-sm shadow-blue-500/25 whitespace-nowrap active:scale-[0.98]"
                            >
                                Grant Access
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section className="rounded-[32px] lg:rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xl lg:shadow-sm shadow-slate-200/40">
                <div className="border-b border-slate-100 px-6 sm:px-8 lg:px-5 py-5 sm:py-6 lg:py-4 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-lg font-black lg:font-bold text-slate-900 tracking-tight">
                            Current Access List
                        </h2>

                        <p className="text-xs sm:text-sm lg:text-xs text-slate-400 font-semibold mt-0.5">
                            {permissions.length} active authorization{permissions.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="hidden sm:block h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                </div>

                {permissions.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 grayscale opacity-50">
                            🛡️
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                            No permissions found for this folder.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[640px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-[10px] sm:text-xs lg:text-xs uppercase lg:normal-case tracking-[0.2em] lg:tracking-wide text-slate-400 font-black lg:font-semibold">
                                    <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-3.5 text-left">User</th>
                                    <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-3.5 text-left">Access</th>
                                    <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-3.5 text-left">Granted On</th>
                                    <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {permissions.map((permission) => (
                                    <tr
                                        key={permission._id}
                                        className="group hover:bg-slate-50 transition-all duration-200"
                                    >
                                        <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-4">
                                            <div className="flex items-center gap-3 sm:gap-4 lg:gap-3">
                                                <div className="w-10 h-10 lg:w-9 lg:h-9 rounded-full lg:rounded-lg bg-blue-600 lg:bg-blue-50 flex items-center justify-center text-sm lg:text-xs font-black lg:font-bold text-white lg:text-blue-600 shadow-sm ring-4 lg:ring-0 ring-blue-50 transition-transform group-hover:scale-110 lg:group-hover:scale-100 border border-blue-100">
                                                    {(permission.userId?.name || permission.user?.name || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm sm:text-base lg:text-sm font-bold lg:font-semibold text-slate-900 leading-none">
                                                        {permission.userId?.name || permission.user?.name || "System User"}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs lg:text-[11px] text-slate-400 font-bold lg:font-medium uppercase lg:normal-case tracking-wider lg:tracking-normal mt-1.5">
                                                        {permission.userId?.email || permission.user?.email || "internal_id"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-4">
                                            <select
                                                value={permission.access}
                                                onChange={(e) =>
                                                    updatePermission(
                                                        permission._id,
                                                        e.target.value
                                                    )
                                                }
                                                className="h-10 lg:h-9 px-3 rounded-xl lg:rounded-lg border border-slate-200 bg-white text-xs sm:text-sm lg:text-xs font-bold lg:font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-slate-50"
                                            >
                                                <option value="view">View Only</option>
                                                <option value="edit">Edit Access</option>
                                                <option value="admin">Full Admin</option>
                                            </select>
                                        </td>

                                        <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-4 text-xs sm:text-sm lg:text-sm text-slate-500 font-semibold lg:font-medium whitespace-nowrap">
                                            {permission.createdAt
                                                ? new Date(permission.createdAt).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })
                                                : "Initial Setup"}
                                        </td>

                                        <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-4 text-right">
                                            <button
                                                onClick={() => deletePermission(permission._id)}
                                                className="h-10 lg:h-9 px-5 lg:px-3 rounded-xl lg:rounded-lg text-[10px] sm:text-xs lg:text-xs font-black lg:font-semibold uppercase lg:normal-case tracking-widest lg:tracking-normal text-red-500 hover:bg-red-50 active:bg-red-100 transition-all"
                                            >
                                                Revoke
                                            </button>
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