import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function SearchPage() {
    const navigate = useNavigate();

    const [q, setQ] = useState("");
    const [type, setType] = useState("all");
    const [results, setResults] = useState({ files: [], folders: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const search = async (e) => {
        e.preventDefault();

        if (!q.trim()) {
            setError("Please enter a search query.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await api.get("/search", {
                params: {
                    q,
                    type,
                    page: 1,
                    limit: 20,
                },
            });

            const data = res.data?.data || res.data;

            setResults({
                files: data?.files || data?.results?.files || [],
                folders: data?.folders || data?.results?.folders || [],
            });
        } catch (err) {
            console.error(err);
            setError("Failed to search.");
        } finally {
            setLoading(false);
        }
    };

    const openFile = (fileId) => {
        navigate(`/files/${fileId}`);
    };

    const openFolder = (folderId) => {
        navigate(`/files?folderId=${folderId}`);
    };

    const files = results.files || [];
    const folders = results.folders || [];

    return (
        <div className="p-5 max-w-[1500px] mx-auto bg-[#f8fafc] min-h-full">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-[30px] font-bold tracking-tight text-slate-900">
                    Search
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    Search files, folders, uploaders, and commit messages across the repository.
                </p>
            </div>

            {/* Search Form */}
            <form
                onSubmit={search}
                className="rounded-md border border-slate-200 bg-white p-5 shadow-sm mb-6"
            >
                <div className="grid gap-3 grid-cols-1 md:grid-cols-[1fr_180px_120px]">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search documents, folders, uploaders..."
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="all">All</option>
                        <option value="files">Files</option>
                        <option value="folders">Folders</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-10 rounded-md bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700">
                        {error}
                    </div>
                )}
            </form>

            {/* File Results */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm mb-6">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Files
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {files.length} matching files
                        </p>
                    </div>
                </div>

                {files.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No file results found.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {files.map((file) => (
                            <button
                                key={file._id}
                                onClick={() => openFile(file._id)}
                                className="block w-full px-5 py-4 text-left hover:bg-slate-50 transition-all"
                            >
                                <div className="flex items-start justify-between gap-5">
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-800 truncate">
                                            {file.originalName ||
                                                file.name ||
                                                file.fileName ||
                                                "Untitled file"}
                                        </p>

                                        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-400">
                                            <span>
                                                Uploader:{" "}
                                                {file.uploader?.name ||
                                                    file.uploadedBy?.name ||
                                                    file.uploaderName ||
                                                    "-"}
                                            </span>

                                            <span>
                                                Commit:{" "}
                                                {file.commitMessage ||
                                                    file.message ||
                                                    "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        <span className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                            File
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Folder Results */}
            <section className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-[18px] font-semibold text-slate-900">
                            Folders
                        </h2>

                        <p className="text-[12px] text-slate-400 mt-1">
                            {folders.length} matching folders
                        </p>
                    </div>
                </div>

                {folders.length === 0 ? (
                    <div className="px-5 py-12 text-[13px] text-slate-500">
                        No folder results found.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {folders.map((folder) => (
                            <button
                                key={folder._id}
                                onClick={() => openFolder(folder._id)}
                                className="block w-full px-5 py-4 text-left hover:bg-slate-50 transition-all"
                            >
                                <div className="flex items-start justify-between gap-5">
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-800 truncate">
                                            {folder.name || "Untitled folder"}
                                        </p>

                                        <p className="mt-2 text-[11px] text-slate-400 truncate">
                                            Path: {folder.path || "-"}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                            Folder
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}