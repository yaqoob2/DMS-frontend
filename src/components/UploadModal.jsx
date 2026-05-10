import { useState } from 'react';

export default function UploadModal({ isOpen, file, folders = [], onUpload, onClose }) {
  const [commitMessage, setCommitMessage] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!commitMessage.trim()) return;

    try {
      setIsUploading(true);
      await onUpload(file, commitMessage, folderId || null, setProgress);
      setCommitMessage('');
      setFolderId('');
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Upload File</h2>

          {!isUploading && (
            <button onClick={onClose} className="text-slate-500 hover:text-white">
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400">
              📄
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Folder
            </label>

            <select
              disabled={isUploading}
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Root / No folder</option>
              {folders.map((folder) => (
                <option key={folder.id || folder._id} value={folder.id || folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Commit Message
            </label>

            <textarea
              autoFocus
              required
              disabled={isUploading}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Example: Initial upload for client contract"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          {file.size > 20 * 1024 * 1024 && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl p-3">
              Large file warning: this file is above 20 MB.
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-400">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {!isUploading && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isUploading || !commitMessage.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-xl text-sm font-semibold"
            >
              {isUploading ? 'Uploading...' : 'Commit Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatFileSize(bytes = 0) {
  if (!bytes) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}