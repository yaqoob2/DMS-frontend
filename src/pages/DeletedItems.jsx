import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export default function DeletedItems() {
    const [deletedFiles, setDeletedFiles] = useState([]);
    const [deletedFolders, setDeletedFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState(null);
    const [error, setError] = useState("");
    const [filesPage, setFilesPage] = useState(1);
    const [foldersPage, setFoldersPage] = useState(1);

    const filesPerPage = 3;
    const foldersPerPage = 3;

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
            setFilesPage(1);
            setFoldersPage(1);
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
            year: "numeric",
            month: "short",
            day: "numeric",
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

    const filesTotalPages = Math.ceil(deletedFiles.length / filesPerPage);
    const foldersTotalPages = Math.ceil(deletedFolders.length / foldersPerPage);

    const paginatedFiles = useMemo(() => {
        const start = (filesPage - 1) * filesPerPage;
        return deletedFiles.slice(start, start + filesPerPage);
    }, [deletedFiles, filesPage]);

    const paginatedFolders = useMemo(() => {
        const start = (foldersPage - 1) * foldersPerPage;
        return deletedFolders.slice(start, start + foldersPerPage);
    }, [deletedFolders, foldersPage]);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Initialising Recovery Archive...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-6 py-6 lg:py-5 bg-[#f8fafc] min-h-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-8 lg:mb-5">
                <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-black tracking-tight text-slate-900 leading-tight">
                    Recovery <span className="text-blue-600">Archive</span>
                </h1>

                <p className="mt-2 lg:mt-1 text-sm sm:text-base lg:text-sm text-slate-500 font-medium">
                    Restoration vault for items deleted within the last 30 days.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl lg:rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold mb-6">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {/* Deleted Files */}
            <section className="rounded-[32px] lg:rounded-[18px] border border-slate-200 bg-white overflow-hidden shadow-xl lg:shadow-sm shadow-slate-200/40 mb-8 lg:mb-5">
                <div className="border-b border-slate-100 px-6 sm:px-8 lg:px-5 py-5 sm:py-6 lg:py-3 flex items-center justify-between bg-slate-50/30 lg:bg-white">
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-base font-black text-slate-900 tracking-tight">
                            Deleted Files
                        </h2>
                        <p className="text-xs sm:text-sm lg:text-[11px] text-slate-400 font-semibold mt-0.5">
                            Showing {paginatedFiles.length} of {deletedFiles.length} files
                        </p>
                    </div>
                </div>

                {deletedFiles.length === 0 ? (
                    <div className="px-8 py-16 lg:py-10 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">
                            No files in the recovery archive.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse min-w-[720px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-[10px] sm:text-xs lg:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-left">
                                            Document Details
                                        </th>
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-left">
                                            MIME Type
                                        </th>
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-left">
                                            Size
                                        </th>
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-left">
                                            Deleted Date
                                        </th>
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {paginatedFiles.map((file) => (
                                        <tr
                                            key={file._id}
                                            className="group hover:bg-slate-50/80 transition-all"
                                        >
                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3">
                                                <div className="flex items-center gap-3 sm:gap-4 lg:gap-3">
                                                    <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-2xl lg:rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-xl lg:text-sm shadow-sm group-hover:scale-105 transition-transform">
                                                        📄
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm sm:text-base lg:text-sm font-bold text-slate-900 leading-none truncate max-w-[260px]">
                                                            {file.originalName || file.name || "Untitled Asset"}
                                                        </p>
                                                        <p className="text-[10px] lg:text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1.5">
                                                            Archived File
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3">
                                                <span className="inline-flex items-center px-2.5 lg:px-2 py-1 lg:py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] lg:text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                    {file.mimeType?.split("/")[1] || "DOC"}
                                                </span>
                                            </td>

                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3 text-xs sm:text-sm lg:text-xs text-slate-600 font-bold">
                                                {formatSize(file.size)}
                                            </td>

                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3 text-xs sm:text-sm lg:text-xs text-slate-500 font-semibold whitespace-nowrap">
                                                {formatDate(file.deletedAt || file.updatedAt)}
                                            </td>

                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3 text-right">
                                                <button
                                                    onClick={() => restoreFile(file._id)}
                                                    disabled={restoringId === file._id}
                                                    className="h-10 lg:h-8 px-6 lg:px-4 rounded-xl lg:rounded-lg bg-blue-600 text-white text-[10px] sm:text-xs lg:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg lg:shadow-sm shadow-blue-500/20 active:scale-95"
                                                >
                                                    {restoringId === file._id ? "Processing" : "Restore"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filesTotalPages > 1 && (
                            <div className="border-t border-slate-100 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                                <p className="text-xs lg:text-[11px] font-bold text-slate-500">
                                    Files page {filesPage} of {filesTotalPages}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFilesPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={filesPage === 1}
                                        className="h-9 lg:h-8 px-4 lg:px-3 rounded-lg border border-slate-200 bg-white text-xs lg:text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        onClick={() => setFilesPage((prev) => Math.min(prev + 1, filesTotalPages))}
                                        disabled={filesPage === filesTotalPages}
                                        className="h-9 lg:h-8 px-4 lg:px-3 rounded-lg border border-slate-200 bg-slate-900 text-xs lg:text-[10px] font-black uppercase tracking-wider text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Deleted Folders */}
            <section className="rounded-[32px] lg:rounded-[18px] border border-slate-200 bg-white overflow-hidden shadow-xl lg:shadow-sm shadow-slate-200/40">
                <div className="border-b border-slate-100 px-6 sm:px-8 lg:px-5 py-5 sm:py-6 lg:py-3 flex items-center justify-between bg-slate-50/30 lg:bg-white">
                    <div>
                        <h2 className="text-lg sm:text-xl lg:text-base font-black text-slate-900 tracking-tight">
                            Deleted Folders
                        </h2>
                        <p className="text-xs sm:text-sm lg:text-[11px] text-slate-400 font-semibold mt-0.5">
                            Showing {paginatedFolders.length} of {deletedFolders.length} folders
                        </p>
                    </div>
                </div>

                {deletedFolders.length === 0 ? (
                    <div className="px-8 py-16 lg:py-10 text-center">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] sm:text-xs">
                            No folders in the recovery archive.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse min-w-[640px]">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr className="text-[10px] sm:text-xs lg:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-left">
                                            Folder Details
                                        </th>
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-left">
                                            Deleted Date
                                        </th>
                                        <th className="px-6 sm:px-8 lg:px-5 py-4 lg:py-2.5 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {paginatedFolders.map((folder) => (
                                        <tr
                                            key={folder._id}
                                            className="group hover:bg-slate-50/80 transition-all"
                                        >
                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3">
                                                <div className="flex items-center gap-3 sm:gap-4 lg:gap-3">
                                                    <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-2xl lg:rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-xl lg:text-sm shadow-sm group-hover:scale-105 transition-transform">
                                                        📁
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm sm:text-base lg:text-sm font-bold text-slate-900 leading-none truncate max-w-[260px]">
                                                            {folder.name || "Untitled Collection"}
                                                        </p>
                                                        <p className="text-[10px] lg:text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1.5">
                                                            Archived Folder
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3 text-xs sm:text-sm lg:text-xs text-slate-500 font-semibold whitespace-nowrap">
                                                {formatDate(folder.deletedAt || folder.updatedAt)}
                                            </td>

                                            <td className="px-6 sm:px-8 lg:px-5 py-5 lg:py-3 text-right">
                                                <button
                                                    onClick={() => restoreFolder(folder._id)}
                                                    disabled={restoringId === folder._id}
                                                    className="h-10 lg:h-8 px-6 lg:px-4 rounded-xl lg:rounded-lg bg-blue-600 text-white text-[10px] sm:text-xs lg:text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg lg:shadow-sm shadow-blue-500/20 active:scale-95"
                                                >
                                                    {restoringId === folder._id ? "Processing" : "Restore"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {foldersTotalPages > 1 && (
                            <div className="border-t border-slate-100 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                                <p className="text-xs lg:text-[11px] font-bold text-slate-500">
                                    Folders page {foldersPage} of {foldersTotalPages}
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFoldersPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={foldersPage === 1}
                                        className="h-9 lg:h-8 px-4 lg:px-3 rounded-lg border border-slate-200 bg-white text-xs lg:text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        onClick={() => setFoldersPage((prev) => Math.min(prev + 1, foldersTotalPages))}
                                        disabled={foldersPage === foldersTotalPages}
                                        className="h-9 lg:h-8 px-4 lg:px-3 rounded-lg border border-slate-200 bg-slate-900 text-xs lg:text-[10px] font-black uppercase tracking-wider text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
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