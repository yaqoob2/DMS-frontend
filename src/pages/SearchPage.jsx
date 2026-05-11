import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [q, setQ] = useState("");
    const [type, setType] = useState("all");
    const [results, setResults] = useState({ files: [], folders: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runSearch = async (queryValue, typeValue = type) => {
        if (!queryValue.trim()) return;

        try {
            setLoading(true);
            setError("");

            const res = await api.get("/search", {
                params: {
                    q: queryValue.trim(),
                    query: queryValue.trim(),
                    search: queryValue.trim(),
                    type: typeValue,
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

    useEffect(() => {
        const urlQuery = searchParams.get("q");

        if (urlQuery) {
            setQ(urlQuery);
            runSearch(urlQuery, type);
        }
    }, [searchParams]);

    const search = async (e) => {
        e.preventDefault();

        if (!q.trim()) {
            setError("Please enter a search query.");
            return;
        }

        navigate(`/search?q=${encodeURIComponent(q.trim())}`);
        runSearch(q.trim(), type);
    };

    const openFile = (fileId) => navigate(`/files/${fileId}`);
    const openFolder = (folderId) => navigate(`/files?folderId=${folderId}`);

    const files = results.files || [];
    const folders = results.folders || [];

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-7 bg-[#f8fafc] min-h-full overflow-x-hidden">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-slate-900 leading-tight">
                    Universal <span className="text-blue-600">Search</span>
                </h1>

                <p className="mt-1 text-sm text-slate-500 font-medium">
                    Locate files and folders across your repository.
                </p>
            </div>

            <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm mb-6">
                <form onSubmit={search}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-7 lg:col-span-8 relative">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by file name or folder name..."
                                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            />

                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="md:col-span-3 lg:col-span-2">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                            >
                                <option value="all">All Items</option>
                                <option value="files">Files Only</option>
                                <option value="folders">Folders Only</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center"
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
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-bold">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}
                </form>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900">
                            Matching <span className="text-blue-600">Files</span>
                        </h2>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {files.length} Found
                        </span>
                    </div>

                    {files.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-slate-400 font-bold text-sm">
                                No files found matching query.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {files.map((file) => (
                                <button
                                    key={file._id || file.id}
                                    onClick={() => openFile(file._id || file.id)}
                                    className="w-full px-5 py-4 text-left hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                            📄
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-black text-slate-900 truncate">
                                                {file.originalName || file.name || "Untitled File"}
                                            </h3>

                                            <p className="mt-1 text-[11px] font-bold text-slate-400 truncate">
                                                {file.uploader?.name || file.uploadedBy?.name || "System"}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-900">
                            Matching <span className="text-amber-600">Folders</span>
                        </h2>
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {folders.length} Found
                        </span>
                    </div>

                    {folders.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-slate-400 font-bold text-sm">
                                No folders found matching query.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {folders.map((folder) => (
                                <button
                                    key={folder._id || folder.id}
                                    onClick={() => openFolder(folder._id || folder.id)}
                                    className="w-full px-5 py-4 text-left hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                            📁
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-black text-slate-900 truncate">
                                                {folder.name || "Untitled Folder"}
                                            </h3>

                                            <p className="mt-1 text-[11px] font-bold text-slate-400 truncate">
                                                Path: {folder.path || "/root"}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}