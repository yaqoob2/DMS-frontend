import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { fileService, folderService } from "../api/services";
import UploadModal from "../components/UploadModal";
import CreateFolderModal from "../components/CreateFolderModal";

export default function FileExplorer() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [foldersRes, filesRes] = await Promise.all([
        folderService.getAll().catch(() => ({ data: [] })),
        fileService.getAll().catch(() => ({ data: [] })),
      ]);

      setFolders(
        Array.isArray(foldersRes.data)
          ? foldersRes.data
          : foldersRes.data?.folders || []
      );

      setFiles(
        Array.isArray(filesRes.data)
          ? filesRes.data
          : filesRes.data?.files || []
      );

      setError("");
    } catch {
      setError("Synchronisation with the central vault failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getId = (item) => item?.id || item?._id;

  const selectedFolderId = getId(selectedFolder);

  const visibleFiles = selectedFolder
    ? files.filter((file) => {
      const fileFolderId =
        file.folderId?._id ||
        file.folderId?.id ||
        file.folderId ||
        file.folder?._id ||
        file.folder?.id ||
        file.folder;

      return String(fileFolderId) === String(selectedFolderId);
    })
    : files;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setIsUploadModalOpen(true);
    }

    e.target.value = "";
  };

  const handleUpload = async (
    file,
    commitMessage,
    folderId = null,
    onProgress
  ) => {
    try {
      const finalFolderId = selectedFolderId || folderId;

      const formData = new FormData();

      formData.append("file", file);
      formData.append("commitMessage", commitMessage);

      if (finalFolderId) {
        formData.append("folderId", finalFolderId);
      }

      await fileService.upload(formData, onProgress);

      setIsUploadModalOpen(false);
      setSelectedFile(null);

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Upload protocol failed");
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      await folderService.create({ name });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Folder creation refused");
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Permanent deletion of this folder? This action is audited.")) return;

    try {
      await folderService.delete(id, {
        confirm: true,
        reason: "Operational removal via web interface",
      });

      if (String(selectedFolderId) === String(id)) {
        setSelectedFolder(null);
      }

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Folder deletion sequence failed");
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Verify permanent asset deletion?")) return;

    try {
      await fileService.delete(id, {
        confirm: true,
        reason: "Operational removal via web interface",
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Asset deletion sequence failed");
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-[#f8fafc] min-h-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 lg:mb-12">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Central <span className="text-blue-600">Asset Vault</span>
          </h1>

          <nav className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <button
              onClick={() => setSelectedFolder(null)}
              className="hover:text-blue-600 transition-colors"
            >
              Master Node
            </button>

            <span className="text-slate-300">/</span>

            <span className="text-slate-900 truncate max-w-[200px]">
              {selectedFolder ? selectedFolder.name : "Unfiltered Archive"}
            </span>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {selectedFolder && (
            <button
              onClick={() => setSelectedFolder(null)}
              className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
            >
              Return
            </button>
          )}

          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="h-12 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> New Node
          </button>

          <label className="h-12 px-8 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/25 active:scale-95">
            Ingest Asset

            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </div>

      {/* Synchronisation Status */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 text-xs font-bold mb-8 animate-in fade-in slide-in-from-top-4">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accessing Data Segments...</p>
        </div>
      ) : (
        <div className="space-y-10 lg:space-y-16">
          {/* Folders Navigation */}
          {!selectedFolder && (
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black">
                  Data Partitions
                </h2>

                <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  {folders.length} Identified
                </span>
              </div>

              {folders.length === 0 ? (
                <div className="rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center">
                  <p className="text-slate-400 font-bold text-sm">Zero partitions established. Use "New Node" to begin.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                  {folders.map((folder) => {
                    const folderId = getId(folder);

                    return (
                      <div
                        key={folderId}
                        onClick={() => setSelectedFolder(folder)}
                        className="group bg-white border border-slate-200 rounded-[2rem] p-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
                      >
                        <div className="relative z-10 flex flex-col items-center sm:items-start">
                          <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            📁
                          </div>

                          <div className="w-full text-center sm:text-left">
                            <h3 className="text-sm font-black text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                              {folder.name || "Unnamed Partition"}
                            </h3>

                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                              Node ID: {String(folderId).slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) =>
                            handleDeleteFolder(folderId, e)
                          }
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 h-8 w-8 rounded-xl hover:bg-red-50 text-red-500 flex items-center justify-center transition-all duration-300"
                          title="Purge Node"
                        >
                          <svg size={16} className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Files Archive */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black">
                {selectedFolder
                  ? `Segment: ${selectedFolder.name}`
                  : "All Assets Archive"}
              </h2>

              <span className="px-3 py-1 rounded-full bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {visibleFiles.length} Encrypted Assets
              </span>
            </div>

            {/* Premium Table - Hidden on smaller mobile, Scrollable on tablets */}
            <div className="hidden sm:block bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/40">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.25em] text-slate-400 font-black border-b border-slate-100">
                      <th className="px-8 py-5 text-left">Asset Identification</th>
                      <th className="px-8 py-5 text-left">Payload</th>
                      <th className="px-8 py-5 text-left">Custodian</th>
                      <th className="px-8 py-5 text-left">Revision</th>
                      <th className="px-8 py-5 text-right">Operations</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {visibleFiles.map((file) => {
                      const fileId = getId(file);

                      return (
                        <tr
                          key={fileId}
                          className="group hover:bg-slate-50/50 transition-all duration-300"
                        >
                          <td className="px-8 py-5">
                            <Link
                              to={`/files/${fileId}`}
                              className="flex items-center gap-4"
                            >
                              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                📄
                              </div>

                              <div className="min-w-0">
                                <p className="text-[13px] font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {file.name || file.originalName || "Unnamed Asset"}
                                </p>

                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                  System Document
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="px-8 py-5 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            {formatFileSize(file.size)}
                          </td>

                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                                {(file.uploader?.name || "U").charAt(0)}
                              </div>
                              <span className="text-[11px] font-bold text-slate-600 italic">
                                {file.uploader?.name || file.uploadedBy?.name || "System"}
                              </span>
                            </div>
                          </td>

                          <td className="px-8 py-5">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                              v{file.currentVersion || file.version || 1}
                            </span>
                          </td>

                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() =>
                                handleDeleteFile(fileId)
                              }
                              className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all active:scale-95"
                            >
                              Purge
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards - Only on very small screens */}
            <div className="sm:hidden space-y-4">
              {visibleFiles.map((file) => {
                const fileId = getId(file);

                return (
                  <div
                    key={fileId}
                    className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm active:scale-[0.98] transition-transform"
                  >
                    <Link
                      to={`/files/${fileId}`}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0">
                          📄
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-black text-slate-900 leading-tight mb-2">
                            {file.name || file.originalName || "Unnamed Asset"}
                          </h3>

                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              {formatFileSize(file.size)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                              v{file.currentVersion || file.version || 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                            {(file.uploader?.name || "U").charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 italic">
                            {file.uploader?.name || file.uploadedBy?.name || "System"}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteFile(fileId);
                          }}
                          className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                        >
                          Purge
                        </button>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {visibleFiles.length === 0 && (
                <div className="rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl mb-6 grayscale opacity-50">
                      📂
                    </div>

                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      Node Empty
                    </p>

                    <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed max-w-[200px] mx-auto">
                      No assets identified in this data segment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        file={selectedFile}
        folders={folders}
        onUpload={handleUpload}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
      />
    </div>
  );
}

function formatFileSize(bytes = 0) {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}