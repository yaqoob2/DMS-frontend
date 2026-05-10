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
        const confirmed = window.confirm(
            "Remove this permission?"
        );

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
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Folder Permissions
                </h1>

                <p className="mt-4 text-slate-500">
                    Loading permissions...
                </p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-[1500px] mx-auto bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
                    Folder Permissions
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    Manage folder access permissions for users.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 mb-5">
                    {error}
                </div>
            )}

            {/* Controls */}
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm mb-6">
                <div className="mb-5">
                    <label className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400 mb-2">
                        Select Folder
                    </label>

                    <select
                        value={selectedFolder}
                        onChange={(e) =>
                            setSelectedFolder(e.target.value)
                        }
                        className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                </div>

                <form
                    onSubmit={addPermission}
                    className="grid gap-3 grid-cols-1 md:grid-cols-3"
                >
                    <select
                        value={form.userId}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                userId: e.target.value,
                            })
                        }
                        required
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                    <select
                        value={form.access}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                access: e.target.value,
                            })
                        }
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        type="submit"
                        disabled={saving}
                        className="h-10 rounded-md bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
                    >
                        Add Permission
                    </button>
                </form>
            </section>

            {/* Permissions Table */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Current Permissions
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {permissions.length} active permissions
                        </p>
                    </div>
                </div>

                {permissions.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No permissions assigned yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                    <th className="px-5 py-3 text-left font-bold">
                                        User
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Access
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
                                {permissions.map((permission) => (
                                    <tr
                                        key={permission._id}
                                        className="hover:bg-slate-50 transition-all"
                                    >
                                        {/* User */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-800">
                                                    {permission.userId?.name ||
                                                        permission.user?.name ||
                                                        "-"}
                                                </p>

                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    Authorized User
                                                </p>
                                            </div>
                                        </td>

                                        {/* Access */}
                                        <td className="px-5 py-4">
                                            <select
                                                value={permission.access}
                                                onChange={(e) =>
                                                    updatePermission(
                                                        permission._id,
                                                        e.target.value
                                                    )
                                                }
                                                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-[12px] outline-none focus:border-blue-500"
                                            >
                                                <option value="view">View</option>
                                                <option value="edit">Edit</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>

                                        {/* Created */}
                                        <td className="px-5 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                                            {permission.createdAt
                                                ? new Date(
                                                    permission.createdAt
                                                ).toLocaleString()
                                                : "-"}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    deletePermission(permission._id)
                                                }
                                                className="h-9 px-3 rounded-md bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-all"
                                            >
                                                Remove
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