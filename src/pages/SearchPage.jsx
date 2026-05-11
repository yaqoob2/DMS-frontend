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
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-[#f8fafc] min-h-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-8 lg:mb-10">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    Universal <span className="text-blue-600">Search</span>
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
                    Locate files, folders, and metadata across your entire repository.
                </p>
            </div>

            {/* Search Form Card */}
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/40 mb-8 lg:mb-12">
                <form onSubmit={search} className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-7 lg:col-span-8 relative">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by name, uploader, or message..."
                                className="w-full h-14 sm:h-16 pl-14 pr-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm sm:text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            />
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="md:col-span-3 lg:col-span-2">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-14 sm:h-16 px-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-black uppercase tracking-widest text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none text-center"
                            >
                                <option value="all">All Items</option>
                                <option value="files">Files Only</option>
                                <option value="folders">Folders Only</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 lg:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 sm:h-16 rounded-2xl bg-blue-600 text-white text-sm sm:text-base font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Search"
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-xs sm:text-sm text-red-600 font-bold animate-in fade-in slide-in-from-top-2">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}
                </form>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* File Results */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Matching <span className="text-blue-600">Files</span>
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {files.length} Found
                        </span>
                    </div>

                    <div className="space-y-4">
                        {files.length === 0 ? (
                            <div className="rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center">
                                <p className="text-slate-400 font-bold text-sm">No files found matching query.</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <button
                                    key={file._id}
                                    onClick={() => openFile(file._id)}
                                    className="w-full group rounded-[2rem] border border-slate-200 bg-white p-6 text-left hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            📄
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm sm:text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                {file.originalName || file.name || "Untitled Asset"}
                                            </h3>
                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="text-slate-300">👤</span>
                                                    {file.uploader?.name || file.uploadedBy?.name || "System"}
                                                </span>
                                                <span className="flex items-center gap-1.5 max-w-[200px] truncate">
                                                    <span className="text-slate-300">💬</span>
                                                    {file.commitMessage || "No message"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </section>

                {/* Folder Results */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            Matching <span className="text-amber-600">Folders</span>
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {folders.length} Found
                        </span>
                    </div>

                    <div className="space-y-4">
                        {folders.length === 0 ? (
                            <div className="rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center">
                                <p className="text-slate-400 font-bold text-sm">No folders found matching query.</p>
                            </div>
                        ) : (
                            folders.map((folder) => (
                                <button
                                    key={folder._id}
                                    onClick={() => openFolder(folder._id)}
                                    className="w-full group rounded-[2rem] border border-slate-200 bg-white p-6 text-left hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                            📁
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm sm:text-base font-black text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                                                {folder.name || "Untitled Collection"}
                                            </h3>
                                            <p className="mt-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                                                Path: {folder.path || "/root"}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}