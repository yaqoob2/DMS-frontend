import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function UserManagement() {
    const { user: currentUser } = useAuth();

    const isSuperAdmin =
        currentUser?.role?.toLowerCase() === "superadmin";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [uploadingImageId, setUploadingImageId] = useState(null);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "owner",
    });

    const loadUsers = async () => {
        if (!isSuperAdmin) {
            setLoading(false);
            return;
        }

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
    }, [isSuperAdmin]);

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
        const confirmed = window.confirm(
            "Permanently delete this user? This action is audited."
        );
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

    const uploadProfileImage = async (userId, file) => {
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG, and WEBP images are allowed.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert("Profile image must be less than 2MB.");
            return;
        }

        try {
            setUploadingImageId(userId);

            const formData = new FormData();
            formData.append("profileImage", file);

            const res = await api.patch(
                `/users/${userId}/profile-image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const updatedUser = res.data?.user;

            if (updatedUser) {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId ? updatedUser : user
                    )
                );
            } else {
                await loadUsers();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to upload profile image.");
        } finally {
            setUploadingImageId(null);
        }
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString();
    };

    if (!isSuperAdmin) {
        return (
            <div className="w-full max-w-full px-4 sm:px-6 lg:px-6 py-6 bg-slate-50 min-h-full">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
                    <h1 className="text-xl font-bold text-red-700">
                        Access Denied
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-red-600">
                        Only Super Admin can manage users.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Initialising Personnel Database...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-6 py-6 lg:py-6 bg-slate-50 min-h-full overflow-x-hidden">
            <div className="mb-8 lg:mb-7">
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black lg:font-bold tracking-tight text-slate-900 leading-tight">
                    Personnel <span className="text-blue-600">Control</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base lg:text-sm text-slate-500 font-medium">
                    Manage repository users, roles, and access permissions.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl lg:rounded-lg border border-red-100 bg-red-50 px-6 lg:px-4 py-4 lg:py-3 text-xs sm:text-sm text-red-600 font-bold lg:font-semibold mb-8 lg:mb-6">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            <section className="rounded-[32px] lg:rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-6 shadow-xl lg:shadow-sm shadow-slate-200/40 mb-8 lg:mb-8">
                <div className="mb-8 lg:mb-5">
                    <h2 className="text-xl lg:text-lg font-black lg:font-bold text-slate-900 tracking-tight">
                        Add <span className="text-blue-600">New User</span>
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-xs text-slate-400 font-bold lg:font-semibold uppercase tracking-widest lg:tracking-wide mt-1">
                        Create repository access credentials.
                    </p>
                </div>

                <form
                    onSubmit={createUser}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-4"
                >
                    <InputField
                        label="Full Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Name"
                    />

                    <InputField
                        label="Email Address"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email"
                        type="email"
                    />

                    <InputField
                        label="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        type="password"
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] lg:text-[11px] font-black lg:font-semibold uppercase tracking-[0.2em] lg:tracking-wide text-slate-400 ml-1">
                            Role
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full h-14 lg:h-10 rounded-2xl lg:rounded-lg border border-slate-100 lg:border-slate-200 bg-slate-50/50 px-5 lg:px-3 text-[11px] lg:text-xs font-black lg:font-semibold uppercase tracking-widest lg:tracking-wide text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                        >
                            <option value="owner">Owner</option>
                            <option value="member">Member</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full h-14 lg:h-10 bg-blue-600 text-white rounded-2xl lg:rounded-lg text-[10px] lg:text-xs font-black lg:font-semibold uppercase tracking-[0.2em] lg:tracking-wide hover:bg-blue-700 transition-all shadow-xl lg:shadow-sm shadow-blue-500/25 active:scale-95"
                        >
                            Add User
                        </button>
                    </div>
                </form>
            </section>

            <section className="rounded-[32px] lg:rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xl lg:shadow-sm shadow-slate-200/40">
                <div className="px-8 lg:px-5 py-6 lg:py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <h2 className="text-[11px] lg:text-xs font-black lg:font-semibold text-slate-400 uppercase tracking-[0.3em] lg:tracking-wide">
                        Users
                    </h2>

                    <span className="px-3 py-1 rounded-full lg:rounded-md bg-slate-100 text-[9px] lg:text-[11px] font-black lg:font-semibold text-slate-500 uppercase lg:normal-case tracking-widest lg:tracking-normal">
                        {users.length} active
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
                        <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/20 text-xs tracking-wide text-slate-400 font-semibold border-b border-slate-100">
                                        <th className="px-5 py-3.5 text-left">User</th>
                                        <th className="px-5 py-3.5 text-left">Email</th>
                                        <th className="px-5 py-3.5 text-left">Role</th>
                                        <th className="px-5 py-3.5 text-left">Status</th>
                                        <th className="px-5 py-3.5 text-left">Created</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="group hover:bg-slate-50 transition-all duration-200"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <ProfileImageUploader
                                                        user={user}
                                                        isUploading={uploadingImageId === user._id}
                                                        onUpload={uploadProfileImage}
                                                    />

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 tracking-tight">
                                                            {user.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                            Click image to upload
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                                {user.email}
                                            </td>

                                            <td className="px-5 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => changeRole(user, e.target.value)}
                                                    disabled={savingId === user._id}
                                                    className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase tracking-wide text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer hover:bg-slate-50"
                                                >
                                                    <option value="owner">Owner</option>
                                                    <option value="member">Member</option>
                                                    <option value="superadmin">Superadmin</option>
                                                </select>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                                                        user.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                            : "bg-red-50 text-red-700 border-red-100"
                                                    }`}
                                                >
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm font-medium text-slate-500">
                                                {formatDate(user.createdAt).split(",")[0]}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleStatus(user)}
                                                        disabled={savingId === user._id}
                                                        className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm"
                                                    >
                                                        {user.isActive ? "Revoke" : "Restore"}
                                                    </button>

                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        disabled={savingId === user._id}
                                                        className="h-9 px-3 rounded-lg bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
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

                        <div className="lg:hidden divide-y divide-slate-100">
                            {users.map((user) => (
                                <div key={user._id} className="p-6 space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <ProfileImageUploader
                                                user={user}
                                                isUploading={uploadingImageId === user._id}
                                                onUpload={uploadProfileImage}
                                                mobile
                                            />

                                            <div className="min-w-0">
                                                <h3 className="text-sm font-black text-slate-900 leading-tight truncate">
                                                    {user.name}
                                                </h3>
                                                <p className="text-[11px] font-bold text-slate-500 mt-1 truncate">
                                                    {user.email}
                                                </p>
                                                <p className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-widest">
                                                    Tap image to upload
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${
                                                user.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-red-50 text-red-700 border-red-100"
                                            }`}
                                        >
                                            {user.isActive ? "ACTIVE" : "RESTRICTED"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                Clearance
                                            </p>
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                Epoch
                                            </p>
                                            <p className="text-[11px] text-slate-900 font-black uppercase tracking-widest py-2.5 px-1">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
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

function ProfileImageUploader({ user, isUploading, onUpload, mobile = false }) {
    const inputRef = useRef(null);

    const handleClick = () => {
        if (isUploading) return;
        inputRef.current?.click();
    };

    const handleChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        await onUpload(user._id, file);

        e.target.value = "";
    };

    const imageUrl = user.profileImageUrl;

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={isUploading}
                title="Upload profile image"
                className={`relative shrink-0 overflow-hidden border flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 ${
                    mobile
                        ? "w-14 h-14 rounded-[1.5rem] bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/20"
                        : "w-9 h-9 rounded-lg bg-blue-50 border-blue-100 shadow-sm hover:ring-4 hover:ring-blue-500/10"
                }`}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span
                        className={
                            mobile
                                ? "text-lg font-black text-white"
                                : "text-xs font-bold text-blue-600"
                        }
                    >
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!isUploading && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/45 text-white text-[7px] font-black uppercase tracking-wider py-0.5 opacity-0 hover:opacity-100 transition-opacity">
                        Upload
                    </div>
                )}
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleChange}
            />
        </>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] lg:text-[11px] font-black lg:font-semibold uppercase tracking-[0.2em] lg:tracking-wide text-slate-400 ml-1">
                {label}
            </label>
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                type={type}
                required
                className="w-full h-14 lg:h-10 rounded-2xl lg:rounded-lg border border-slate-100 lg:border-slate-200 bg-slate-50/50 px-5 lg:px-3 text-sm font-bold lg:font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
        </div>
    );
}