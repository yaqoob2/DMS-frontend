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
        return new Date(value).toLocaleString();
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
            <div className="p-6">
                <h1 className="text-2xl font-semibold text-slate-900">Deleted Items</h1>
                <p className="mt-4 text-slate-500">Loading deleted items...</p>
            </div>
        );
    }

    return (
        <div className="p-5 max-w-[1500px] mx-auto bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
                    Deleted Items
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    Restore deleted files and folders from the recovery archive.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 mb-5">
                    {error}
                </div>
            )}

            {/* Deleted Files */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm mb-6">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Deleted Files
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {deletedFiles.length} deleted files
                        </p>
                    </div>
                </div>

                {deletedFiles.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No deleted files found.
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
                                        Type
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Size
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Deleted
                                    </th>

                                    <th className="px-5 py-3 text-right font-bold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {deletedFiles.map((file) => (
                                    <tr
                                        key={file._id}
                                        className="hover:bg-slate-50 transition-all"
                                    >
                                        {/* File */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-800">
                                                    {file.originalName ||
                                                        file.name ||
                                                        file.fileName ||
                                                        "Untitled file"}
                                                </p>

                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    Archived Document
                                                </p>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                                {file.mimeType ||
                                                    file.type ||
                                                    "-"}
                                            </span>
                                        </td>

                                        {/* Size */}
                                        <td className="px-5 py-4 text-[12px] text-slate-600">
                                            {formatSize(file.size)}
                                        </td>

                                        {/* Deleted Date */}
                                        <td className="px-5 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                                            {formatDate(
                                                file.deletedAt ||
                                                file.updatedAt
                                            )}
                                        </td>

                                        {/* Restore */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    restoreFile(file._id)
                                                }
                                                disabled={
                                                    restoringId === file._id
                                                }
                                                className="h-9 px-4 rounded-md bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                                            >
                                                {restoringId === file._id
                                                    ? "Restoring..."
                                                    : "Restore"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Deleted Folders */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Deleted Folders
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {deletedFolders.length} deleted folders
                        </p>
                    </div>
                </div>

                {deletedFolders.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No deleted folders found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                    <th className="px-5 py-3 text-left font-bold">
                                        Folder Name
                                    </th>

                                    <th className="px-5 py-3 text-left font-bold">
                                        Deleted
                                    </th>

                                    <th className="px-5 py-3 text-right font-bold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {deletedFolders.map((folder) => (
                                    <tr
                                        key={folder._id}
                                        className="hover:bg-slate-50 transition-all"
                                    >
                                        {/* Folder */}
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-800">
                                                    {folder.name ||
                                                        "Untitled folder"}
                                                </p>

                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    Archived Folder
                                                </p>
                                            </div>
                                        </td>

                                        {/* Deleted Date */}
                                        <td className="px-5 py-4 text-[12px] text-slate-500 whitespace-nowrap">
                                            {formatDate(
                                                folder.deletedAt ||
                                                folder.updatedAt
                                            )}
                                        </td>

                                        {/* Restore */}
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    restoreFolder(folder._id)
                                                }
                                                disabled={
                                                    restoringId === folder._id
                                                }
                                                className="h-9 px-4 rounded-md bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                                            >
                                                {restoringId === folder._id
                                                    ? "Restoring..."
                                                    : "Restore"}
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