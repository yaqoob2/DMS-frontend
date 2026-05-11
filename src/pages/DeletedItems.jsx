import { useEffect, useState } from "react";
import api from "../api/axios";

export default function DeletedItems() {
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [deletedFolders, setDeletedFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);
    const [error, setError] = useState("");

    const fetchDeletedItems = async () => {
        try {
            setLoading(true);
            setError("");

            const [filesRes, foldersRes] = await Promise.all([
                api.get("/safety/deleted-files"),
                api.get("/safety/deleted-folders"),
            ]);

            setDeletedFiles(filesRes.data?.data || filesRes.data || []);
            setDeletedFolders(foldersRes.data?.data || foldersRes.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load deleted items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedItems();
    }, []);

    const restoreFile = async (fileId) => {
        try {
            setRestoringId(fileId);
            await api.post(`/files/${fileId}/restore-deleted`);
            await fetchDeletedItems();
        } catch (err) {
            console.error(err);
            alert("Failed to restore file.");
        } finally {
            setRestoringId(null);
        }
    };

    const restoreFolder = async (folderId) => {
        try {
            setRestoringId(folderId);
            await api.post(`/folders/${folderId}/restore-deleted`);
            await fetchDeletedItems();
        } catch (err) {
            console.error(err);
            alert("Failed to restore folder.");
        } finally {
            setRestoringId(null);
        }
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Initialising Recovery Archive...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-[#f8fafc] min-h-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-8 lg:mb-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    Recovery <span className="text-blue-600">Archive</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
                    Restoration vault for items deleted within the last 30 days.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 font-bold mb-8">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Deleted Files Table */}
            <section className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40 mb-8 lg:mb-12">
                <div className="border-b border-slate-100 px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            Deleted Files
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-0.5">
                            {deletedFiles.length} item{deletedFiles.length !== 1 ? 's' : ''} available for recovery
                        </p>
                    </div>
                </div>

                {deletedFiles.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">
                            No files in the recovery archive.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[720px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400 font-black">
                                    <th className="px-6 sm:px-8 py-4 text-left">Document Details</th>
                                    <th className="px-6 sm:px-8 py-4 text-left">MIME Type</th>
                                    <th className="px-6 sm:px-8 py-4 text-left">Size</th>
                                    <th className="px-6 sm:px-8 py-4 text-left">Deleted Date</th>
                                    <th className="px-6 sm:px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                                {deletedFiles.map((file) => (
                                    <tr key={file._id} className="group hover:bg-slate-50/80 transition-all">
                                        <td className="px-6 sm:px-8 py-5">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                                    📄
                                                </div>
                                                <div>
                                                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                                                        {file.originalName || file.name || "Untitled Asset"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1.5">
                                                        Archived File
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 sm:px-8 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                {file.mimeType?.split('/')[1] || "DOC"}
                                            </span>
                                        </td>

                                        <td className="px-6 sm:px-8 py-5 text-xs sm:text-sm text-slate-600 font-bold">
                                            {formatSize(file.size)}
                                        </td>

                                        <td className="px-6 sm:px-8 py-5 text-xs sm:text-sm text-slate-500 font-semibold whitespace-nowrap">
                                            {formatDate(file.deletedAt || file.updatedAt)}
                                        </td>

                                        <td className="px-6 sm:px-8 py-5 text-right">
                                            <button
                                                onClick={() => restoreFile(file._id)}
                                                disabled={restoringId === file._id}
                                                className="h-10 px-6 rounded-xl bg-blue-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                            >
                                                {restoringId === file._id ? "Processing" : "Restore"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Deleted Folders Table */}
            <section className="rounded-[32px] border border-slate-200 bg-white overflow-hidden shadow-xl shadow-slate-200/40">
                <div className="border-b border-slate-100 px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between bg-slate-50/30">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                            Deleted Folders
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-0.5">
                            {deletedFolders.length} collection{deletedFolders.length !== 1 ? 's' : ''} available
                        </p>
                    </div>
                </div>

                {deletedFolders.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">
                            No folders in the recovery archive.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse min-w-[640px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-400 font-black">
                                    <th className="px-6 sm:px-8 py-4 text-left">Folder Details</th>
                                    <th className="px-6 sm:px-8 py-4 text-left">Deleted Date</th>
                                    <th className="px-6 sm:px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                                {deletedFolders.map((folder) => (
                                    <tr key={folder._id} className="group hover:bg-slate-50/80 transition-all">
                                        <td className="px-6 sm:px-8 py-5">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                                                    📁
                                                </div>
                                                <div>
                                                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                                                        {folder.name || "Untitled Collection"}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1.5">
                                                        Archived Folder
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 sm:px-8 py-5 text-xs sm:text-sm text-slate-500 font-semibold whitespace-nowrap">
                                            {formatDate(folder.deletedAt || folder.updatedAt)}
                                        </td>

                                        <td className="px-6 sm:px-8 py-5 text-right">
                                            <button
                                                onClick={() => restoreFolder(folder._id)}
                                                disabled={restoringId === folder._id}
                                                className="h-10 px-6 rounded-xl bg-blue-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                            >
                                                {restoringId === folder._id ? "Processing" : "Restore"}
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