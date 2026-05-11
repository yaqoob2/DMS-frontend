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
      setError("Connection failed. Please check your backend.");
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
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      await folderService.create({ name });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create folder");
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Delete this folder?")) return;

    try {
      await folderService.delete(id, {
        confirm: true,
        reason: "Deleted from frontend file explorer",
      });

      if (String(selectedFolderId) === String(id)) {
        setSelectedFolder(null);
      }

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete folder failed");
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await fileService.delete(id, {
        confirm: true,
        reason: "Deleted from frontend file explorer",
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5 max-w-[1450px] mx-auto bg-[#f8fafc] min-h-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-5">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-slate-900">
            Files
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-[12px] text-slate-500">
            <button
              onClick={() => setSelectedFolder(null)}
              className="hover:text-blue-600 font-medium"
            >
              Root
            </button>

            <span>/</span>

            <span className="text-slate-700 font-semibold break-words">
              {selectedFolder ? selectedFolder.name : "All Files"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedFolder && (
            <button
              onClick={() => setSelectedFolder(null)}
              className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Back
            </button>
          )}

          <button
            onClick={() => setIsCreateFolderOpen(true)}
            className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Create Folder
          </button>

          <label className="h-10 px-4 bg-blue-600 rounded-xl text-[12px] font-semibold text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center">
            Upload

            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </div>

      {/* Tip */}
      <div className="mb-5">
        <p className="text-[12px] text-slate-500">
          {selectedFolder
            ? `Uploads will be stored inside "${selectedFolder.name}".`
            : "Click folders to browse their files."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-[12px] mb-5">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-7 h-7 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders */}
          {!selectedFolder && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
                  Folders
                </h2>

                <span className="text-[11px] text-slate-400">
                  {folders.length} folders
                </span>
              </div>

              {folders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-slate-500 text-[13px]">
                  No folders found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                  {folders.map((folder) => {
                    const folderId = getId(folder);

                    return (
                      <div
                        key={folderId}
                        onClick={() => setSelectedFolder(folder)}
                        className="group bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-base mb-3">
                              📁
                            </div>

                            <h3 className="text-[13px] font-semibold text-slate-800 break-words">
                              {folder.name || "Untitled"}
                            </h3>

                            <p className="text-[11px] text-slate-400 mt-1">
                              Folder
                            </p>
                          </div>

                          <button
                            onClick={(e) =>
                              handleDeleteFolder(folderId, e)
                            }
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all text-[11px] font-semibold text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Files */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
                {selectedFolder
                  ? `${selectedFolder.name} Files`
                  : "Files"}
              </h2>

              <span className="text-[11px] text-slate-400">
                {visibleFiles.length} files
              </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      <th className="px-5 py-3 text-left font-bold">
                        Name
                      </th>

                      <th className="px-5 py-3 text-left font-bold">
                        Size
                      </th>

                      <th className="px-5 py-3 text-left font-bold">
                        Uploader
                      </th>

                      <th className="px-5 py-3 text-left font-bold">
                        Version
                      </th>

                      <th className="px-5 py-3 text-right font-bold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleFiles.map((file) => {
                      const fileId = getId(file);

                      return (
                        <tr
                          key={fileId}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-3">
                            <Link
                              to={`/files/${fileId}`}
                              className="flex items-center gap-3 group"
                            >
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm">
                                📄
                              </div>

                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-blue-600">
                                  {file.name ||
                                    file.originalName ||
                                    "Untitled"}
                                </p>

                                <p className="text-[11px] text-slate-400">
                                  Document
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="px-5 py-3 text-[12px] text-slate-500">
                            {formatFileSize(file.size)}
                          </td>

                          <td className="px-5 py-3 text-[12px] text-slate-500">
                            {file.uploader?.name ||
                              file.uploadedBy?.name ||
                              "User"}
                          </td>

                          <td className="px-5 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                              v{file.currentVersion || file.version || 1}
                            </span>
                          </td>

                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() =>
                                handleDeleteFile(fileId)
                              }
                              className="text-[12px] font-semibold text-red-500"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {visibleFiles.map((file) => {
                const fileId = getId(file);

                return (
                  <div
                    key={fileId}
                    className="bg-white border border-slate-200 rounded-xl p-4"
                  >
                    <Link
                      to={`/files/${fileId}`}
                      className="flex items-start gap-3"
                    >
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                        📄
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-semibold text-slate-800 break-words">
                          {file.name ||
                            file.originalName ||
                            "Untitled"}
                        </h3>

                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] text-slate-500">
                            Size: {formatFileSize(file.size)}
                          </p>

                          <p className="text-[11px] text-slate-500 break-words">
                            Uploaded By:{" "}
                            {file.uploader?.name ||
                              file.uploadedBy?.name ||
                              "User"}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                            v{file.currentVersion || file.version || 1}
                          </span>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteFile(fileId);
                            }}
                            className="text-[12px] font-semibold text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}

              {visibleFiles.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl px-6 py-14 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl mb-3">
                      📂
                    </div>

                    <p className="text-[13px] font-semibold text-slate-700">
                      No files found
                    </p>

                    <p className="text-[12px] text-slate-400 mt-1">
                      Upload your first document.
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