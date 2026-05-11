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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 sm:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload <span className="text-blue-600">Asset</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Ingress Protocol</p>
          </div>

          {!isUploading && (
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all shadow-sm"
            >
              ✕
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
          {/* File Identity Card */}
          <div className="bg-slate-50 rounded-[2rem] p-6 flex items-center gap-5 border border-slate-100 shadow-inner">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl shadow-blue-500/20">
              📄
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 truncate tracking-tight">{file.name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Payload: {formatFileSize(file.size)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Target Sector (Folder)
              </label>

              <select
                disabled={isUploading}
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full h-14 bg-slate-50 border border-slate-100 text-slate-900 font-bold rounded-2xl px-5 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all cursor-pointer appearance-none"
              >
                <option value="">Root / System Base</option>
                {folders.map((folder) => (
                  <option key={folder.id || folder._id} value={folder.id || folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Authorisation Message (Commit)
              </label>

              <textarea
                autoFocus
                required
                disabled={isUploading}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Briefly describe this asset's purpose..."
                className="w-full bg-slate-50 border border-slate-100 text-slate-900 font-bold rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all h-32 resize-none"
              />
            </div>
          </div>

          {file.size > 20 * 1024 * 1024 && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-2xl p-4 flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              Heavy payload warning: exceeding 20 MB may increase sync latency.
            </div>
          )}

          {isUploading && (
            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Uploading Payload...</span>
                <span className="text-xl font-black text-slate-900">{progress}%</span>
              </div>

              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-lg shadow-blue-500/20"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {!isUploading && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-14 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Abort
              </button>
            )}

            <button
              type="submit"
              disabled={isUploading || !commitMessage.trim()}
              className="flex-2 h-14 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-200 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/25 active:scale-95"
            >
              {isUploading ? 'Syncing...' : 'Deploy Asset'}
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