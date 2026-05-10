import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fileService, folderService } from '../api/services';
import UploadModal from '../components/UploadModal';

export default function FileExplorer() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [foldersRes, filesRes] = await Promise.all([
        folderService.getAll().catch(() => ({ data: [] })),
        fileService.getAll().catch(() => ({ data: [] })),
      ]);

      const foldersData = Array.isArray(foldersRes.data)
        ? foldersRes.data
        : foldersRes.data?.folders || [];

      const filesData = Array.isArray(filesRes.data)
        ? filesRes.data
        : filesRes.data?.files || [];

      setFolders(foldersData);
      setFiles(filesData);
      setError('');
    } catch {
      setError('Connection failed. Please check your backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items || [];

      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            setSelectedFile(file);
            setIsUploadModalOpen(true);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setIsUploadModalOpen(true);
    }

    e.target.value = '';
  };

  const handleUpload = async (file, commitMessage, folderId = null, onProgress) => {
    try {
      const formData = new FormData();

      formData.append('file', file);
      formData.append('commitMessage', commitMessage);

      if (folderId) {
        formData.append('folderId', folderId);
      }

      await fileService.upload(formData, onProgress);

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileService.delete(id, {
        confirm: true,
        reason: 'Deleted from frontend file explorer',
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Files</h1>

          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hover:text-blue-400 cursor-pointer">Root</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 5l7 7-7 7" strokeWidth={2} />
            </svg>
            <span className="text-slate-300">All Files</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors">
            Create Folder
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                strokeWidth={2}
              />
            </svg>
            Upload
            <input type="file" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-6 italic">
        Tip: Paste a file from your clipboard. It will become a pending upload first.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 mb-8">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Folders
            </h2>

            {folders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-500 text-sm">
                No folders found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id || folder._id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/40 cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-500 mb-3">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>

                    <h3 className="font-medium text-slate-200 truncate">
                      {folder.name || 'Untitled Folder'}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Files
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Uploader</th>
                    <th className="px-6 py-4">Version</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-sm">
                  {files.map((file) => {
                    const fileId = file.id || file._id;

                    return (
                      <tr key={fileId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center text-slate-400">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  strokeWidth={2}
                                />
                              </svg>
                            </div>

                            <Link
                              to={`/files/${fileId}`}
                              className="font-medium text-slate-200 hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              {file.name || file.originalName || 'Untitled File'}
                            </Link>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {formatFileSize(file.size)}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {file.uploader?.name || file.uploadedBy?.name || 'User'}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          v{file.currentVersion || file.version || 1}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteFile(fileId)}
                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                            title="Delete file"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                strokeWidth={2}
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {(!files || files.length === 0) && (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No files uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
    </div>
  );
}

function formatFileSize(bytes = 0) {
  if (!bytes) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}