import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
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

  const getVisibleFolders = () => {
    return folders.filter((folder) => {
      const parentId = folder.parentFolderId?._id || folder.parentFolderId;

      if (selectedFolder) {
        return String(parentId) === String(selectedFolderId);
      }

      if (!parentId) return true;

      const parentExists = folders.some(
        (f) => String(getId(f)) === String(parentId)
      );

      return !parentExists;
    });
  };

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
      toast.error(err.response?.data?.message || "Upload protocol failed");
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      await folderService.create({
        name,
        parentFolderId: selectedFolderId || null,
      });

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Folder creation refused");
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Permanent deletion of this folder? This action is audited."
    );

    if (!confirmDelete) return;

    try {
      await folderService.delete(id, {
        confirm: true,
        reason: "Operational removal via web interface",
      });

      if (String(selectedFolderId) === String(id)) {
        setSelectedFolder(null);
      }

      setFolders((prev) =>
        prev.filter((folder) => String(getId(folder)) !== String(id))
      );

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Folder deletion sequence failed");
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
      toast.error(err.response?.data?.message || "Asset deletion sequence failed");
    }
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-5 lg:px-5 py-5 lg:py-4 bg-slate-50 min-h-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 lg:mb-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-bold tracking-tight text-slate-900 leading-tight">
            File <span className="text-blue-600">Manager</span>
          </h1>

          <nav className="flex items-center gap-2 mt-2 lg:mt-1 text-[11px] lg:text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <button
              type="button"
              onClick={() => setSelectedFolder(null)}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 truncate max-w-[220px]">
              {selectedFolder ? selectedFolder.name : "All Files"}
            </span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedFolder && (
            <button
              type="button"
              onClick={() => setSelectedFolder(null)}
              className="h-9 px-4 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold tracking-wide text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              Back
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCreateFolderOpen(true)}
            className="h-9 px-4 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold tracking-wide text-slate-900 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
          >
            <span className="text-sm leading-none">+</span> New Folder
          </button>

          <label className="h-9 px-5 bg-blue-600 rounded-lg text-[11px] font-semibold tracking-wide text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center shadow-sm">
            Upload File
            <input type="file" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-red-600 text-sm font-semibold mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Loading files...
          </p>
        </div>
      ) : (
        <div className="space-y-6 lg:space-y-5">
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Folders
              </h2>

              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                {getVisibleFolders().length} folders
              </span>
            </div>

            {getVisibleFolders().length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center bg-white">
                <p className="text-slate-400 font-semibold text-sm">
                  No folders yet. Create a new folder to begin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {getVisibleFolders().map((folder) => {
                  const folderId = getId(folder);

                  return (
                    <div
                      key={folderId}
                      onClick={() => setSelectedFolder(folder)}
                      className="group bg-white border border-slate-200 rounded-xl p-4 lg:p-3 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer relative overflow-hidden"
                    >
                      <div className="relative z-10 flex items-start gap-3 pr-8">
                        <div className="w-10 h-10 lg:w-9 lg:h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                          📁
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                            {folder.name || "Unnamed Folder"}
                          </h3>

                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                            ID: {String(folderId).slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteFolder(folderId);
                        }}
                        className="absolute top-2 right-2 z-50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 h-7 w-7 rounded-md hover:bg-red-50 text-red-500 flex items-center justify-center transition-all duration-200"
                        title="Delete Folder"
                      >
                        <svg
                          className="w-3.5 h-3.5 pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                {selectedFolder ? selectedFolder.name : "Files"}
              </h2>

              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                {visibleFiles.length} files
              </span>
            </div>

            <div className="hidden sm:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] tracking-wide text-slate-400 font-semibold border-b border-slate-100">
                      <th className="px-4 py-3 text-left">File Name</th>
                      <th className="px-4 py-3 text-left">Size</th>
                      <th className="px-4 py-3 text-left">Uploaded By</th>
                      <th className="px-4 py-3 text-left">Version</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleFiles.map((file) => {
                      const fileId = getId(file);

                      return (
                        <tr
                          key={fileId}
                          className="group hover:bg-slate-50 transition-all duration-200"
                        >
                          <td className="px-4 py-3">
                            <Link
                              to={`/files/${fileId}`}
                              className="flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                                📄
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {file.name ||
                                    file.originalName ||
                                    "Unnamed File"}
                                </p>

                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  Document
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                            {formatFileSize(file.size)}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-500">
                                {(file.uploader?.name || "U").charAt(0)}
                              </div>
                              <span className="text-xs font-medium text-slate-600">
                                {file.uploader?.name ||
                                  file.uploadedBy?.name ||
                                  "System"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                              v{file.currentVersion || file.version || 1}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteFile(fileId)}
                              className="h-7 px-3 rounded-md text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-all active:scale-95"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {visibleFiles.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center">
                          <p className="text-sm font-semibold text-slate-400">
                            No files found.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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
                            {file.uploader?.name ||
                              file.uploadedBy?.name ||
                              "System"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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