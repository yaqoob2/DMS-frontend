import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fileService } from '../api/services';
import { formatSize, formatDate } from '../utils/formatters';

export default function FileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New Version Upload State
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [fileRes, versionsRes] = await Promise.all([
        fileService.getById(id),
        fileService.getVersions(id)
      ]);
      setFile(fileRes.data);
      // Ensure versions is an array (handle backend object nesting)
      setVersions(Array.isArray(versionsRes.data) ? versionsRes.data : (versionsRes.data?.versions || []));
      setError(null);
    } catch (err) {
      setError('File not found or access denied.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (versionId = null) => {
    try {
      const res = versionId 
        ? await fileService.downloadVersion(id, versionId)
        : await fileService.download(id);
      
      // Handle various backend response formats (direct URL or object)
      const downloadUrl = res.data?.downloadUrl || res.data?.url || res.data?.signedUrl || res.data;
      if (typeof downloadUrl === 'string') {
        window.open(downloadUrl, '_blank');
      } else {
        alert('Could not retrieve download link.');
      }
    } catch (err) {
      alert('Download failed.');
    }
  };

  const handleUploadVersion = async (e) => {
    e.preventDefault();
    if (!newVersionFile || !commitMessage.trim()) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', newVersionFile);
      formData.append('commitMessage', commitMessage);

      // Using the generic upload/newVersion logic with progress
      await fileService.newVersion(id, formData, setProgress);
      
      setNewVersionFile(null);
      setCommitMessage('');
      setProgress(0);
      fetchData(); // Refresh everything
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version as the current one?')) return;
    
    try {
      await fileService.restoreVersion(id, versionId);
      fetchData();
    } catch (err) {
      alert('Restore failed.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <Link to="/files" className="text-blue-400 hover:underline text-sm">Back to Files</Link>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/files" className="hover:text-blue-400">Files</Link>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={2} /></svg>
        <span className="text-slate-200 truncate max-w-[200px]">{file?.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Upload */}
        <div className="lg:col-span-1 space-y-6">
          {/* File Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-1 truncate" title={file?.name}>{file?.name}</h1>
            <p className="text-slate-500 text-sm text-center mb-6 uppercase tracking-widest font-bold">{file?.extension || 'Document'}</p>
            
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <DetailRow label="Size" value={formatSize(file?.size)} />
              <DetailRow label="Version" value={`v${file?.currentVersion || 1}`} />
              <DetailRow label="Owner" value={file?.uploader?.name || 'System'} />
              <DetailRow label="Created" value={formatDate(file?.createdAt)} />
              <DetailRow label="Updated" value={formatDate(file?.updatedAt)} />
            </div>

            <button 
              onClick={() => handleDownload()}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} /></svg>
              Download Current
            </button>
          </div>

          {/* New Version Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Upload New Version</h2>
            <form onSubmit={handleUploadVersion} className="space-y-4">
              <div className="relative">
                <input 
                  type="file" 
                  onChange={(e) => setNewVersionFile(e.target.files[0])}
                  className="hidden" 
                  id="version-file" 
                />
                <label 
                  htmlFor="version-file"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-600 transition-colors bg-slate-950/50"
                >
                  <span className="text-xs text-slate-400 font-medium">
                    {newVersionFile ? newVersionFile.name : 'Choose updated file'}
                  </span>
                </label>
              </div>

              <textarea 
                required
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe changes..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              {uploading && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${progress}%` }} />
                </div>
              )}

              <button 
                disabled={uploading || !newVersionFile}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-xs font-bold transition-all"
              >
                {uploading ? 'Uploading...' : 'Submit Version'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Version History */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-slate-800">
              <h2 className="font-bold text-white">Version History</h2>
            </div>
            
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Ver</th>
                  <th className="px-6 py-4">Changes</th>
                  <th className="px-6 py-4">Uploaded By</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {versions.map((v, idx) => (
                  <tr key={v.id || v._id} className="hover:bg-slate-800/20 text-sm group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${idx === 0 ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                        v{v.versionNumber || (versions.length - idx)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={v.commitMessage}>
                      {v.commitMessage || 'No description provided'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{v.uploader?.name || 'User'}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(v.createdAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleDownload(v.id || v._id)}
                        className="p-1.5 text-slate-500 hover:text-white transition-colors" 
                        title="Download this version"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} /></svg>
                      </button>
                      {idx !== 0 && (
                        <button 
                          onClick={() => handleRestore(v.id || v._id)}
                          className="p-1.5 text-slate-500 hover:text-amber-500 transition-colors" 
                          title="Restore this version"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" strokeWidth={2} /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium">{value}</span>
    </div>
  );
}
