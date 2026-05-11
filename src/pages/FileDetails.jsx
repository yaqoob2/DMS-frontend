import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fileService, commentService, activityService } from "../api/services";
import { formatSize, formatDate } from "../utils/formatters";
import FilePreviewModal from "../components/FilePreviewModal";

export default function FileDetails() {
  const { id } = useParams();

  const [file, setFile] = useState(null);
  const [versions, setVersions] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newVersionFile, setNewVersionFile] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  const [preview, setPreview] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [fileRes, versionsRes, commentsRes, activityRes] =
        await Promise.all([
          fileService.getById(id),
          fileService.getVersions(id).catch(() => ({ data: [] })),
          commentService.getByFile(id).catch(() => ({ data: [] })),
          activityService.getFileActivity(id).catch(() => ({ data: [] })),
        ]);

      setFile(fileRes.data?.file || fileRes.data?.data || fileRes.data);

      setVersions(
        Array.isArray(versionsRes.data)
          ? versionsRes.data
          : versionsRes.data?.versions || []
      );

      setComments(
        Array.isArray(commentsRes.data)
          ? commentsRes.data
          : commentsRes.data?.comments || []
      );

      setActivities(
        Array.isArray(activityRes.data)
          ? activityRes.data
          : activityRes.data?.data ||
          activityRes.data?.activities ||
          activityRes.data?.logs ||
          []
      );

      setError("");
    } catch {
      setError("File not found or access denied.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fileName = file?.name || file?.originalName || "Untitled File";

  const handlePreview = async () => {
    try {
      const res = await fileService.preview(id);
      const previewData = res.data?.data || res.data;

      setPreview(previewData);
      setIsPreviewOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || "Preview failed.");
    }
  };

  const handleDownload = async (versionId = null) => {
    try {
      const res = versionId
        ? await fileService.downloadVersion(id, versionId)
        : await fileService.download(id);

      const downloadUrl =
        res.data?.downloadUrl ||
        res.data?.url ||
        res.data?.signedUrl ||
        res.data;

      if (typeof downloadUrl === "string") {
        window.open(downloadUrl, "_blank");
      } else {
        alert("Could not retrieve download link.");
      }
    } catch {
      alert("Download failed.");
    }
  };

  const handleUploadVersion = async (e) => {
    e.preventDefault();

    if (!newVersionFile || !commitMessage.trim()) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", newVersionFile);
      formData.append("commitMessage", commitMessage);

      await fileService.newVersion(id, formData, setProgress);

      setNewVersionFile(null);
      setCommitMessage("");
      setProgress(0);

      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleRestore = async (versionId) => {
    if (!window.confirm("Restore this version as the current version?")) return;

    try {
      await fileService.restoreVersion(id, versionId);
      fetchData();
    } catch {
      alert("Restore failed.");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      setCommenting(true);
      await commentService.create(id, commentText.trim());
      setCommentText("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Comment failed.");
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await commentService.delete(id, commentId);
      fetchData();
    } catch {
      alert("Delete comment failed.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-black uppercase tracking-[0.2em]">Synchronising Repository...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 min-h-full flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-white border border-slate-200 rounded-[32px] p-8 sm:p-12 max-w-lg w-full text-center shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Access Refused</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <Link to="/files" className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-slate-900 text-white text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
            Return to Vault
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-[#f8fafc] min-h-full overflow-x-hidden">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 lg:mb-10">
          <Link to="/files" className="hover:text-blue-600 transition-colors">Repository</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate max-w-[200px]">{fileName}</span>
        </nav>

        {/* Header Section */}
        <div className="mb-8 lg:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight break-words">
              {fileName}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-700 uppercase tracking-widest">
                Version {file?.currentVersion?.versionNumber || file?.latestVersionNumber || 1}
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Last Activity: {formatDate(file?.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handlePreview}
              className="h-12 px-8 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95"
            >
              Live Preview
            </button>

            <button
              onClick={() => handleDownload()}
              className="h-12 px-8 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              Download Document
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Info & Actions */}
          <div className="xl:col-span-4 space-y-8">
            <Card title="File Specifications">
              <div className="space-y-4">
                <DetailRow
                  label="Payload Size"
                  value={formatSize(file?.currentVersion?.size || file?.size)}
                />
                <DetailRow
                  label="Architecture"
                  value={file?.fileType || file?.extension || "Standard Doc"}
                />
                <DetailRow
                  label="Custodian"
                  value={file?.uploadedBy?.name || "System Auth"}
                />
                <DetailRow
                  label="Storage Hub"
                  value={file?.folderId?.name || "Root Partition"}
                />
                <DetailRow label="Creation Epoch" value={formatDate(file?.createdAt)} />
                <DetailRow label="Recent Pulse" value={formatDate(file?.updatedAt)} />
              </div>
            </Card>

            <Card title="Deploy New Version">
              <form onSubmit={handleUploadVersion} className="space-y-6">
                <div className="relative group">
                  <input
                    type="file"
                    onChange={(e) =>
                      setNewVersionFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-[10px] font-black uppercase tracking-widest text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-5 file:py-3 file:text-[10px] file:font-black file:uppercase file:tracking-[0.2em] file:text-slate-600 hover:file:bg-blue-600 hover:file:text-white file:transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Change Log Message</label>
                  <textarea
                    required
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Describe version improvements..."
                    className="w-full h-32 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50/50 focus:bg-white transition-all resize-none"
                  />
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      <span>Transmission Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  disabled={uploading || !newVersionFile || !commitMessage.trim()}
                  className="w-full h-14 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                >
                  {uploading ? "Uploading Transmission..." : "Push New Version"}
                </button>
              </form>
            </Card>
          </div>

          {/* Right Column: History & Collaboration */}
          <div className="xl:col-span-8 space-y-8">
            <Card title="Version Audit Trail">
              <div className="w-full overflow-x-auto custom-scrollbar -mx-6 sm:mx-0">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                      <th className="px-6 py-4 text-left">Version</th>
                      <th className="px-6 py-4 text-left">Change Log</th>
                      <th className="px-6 py-4 text-left">Author</th>
                      <th className="px-6 py-4 text-left">Timestamp</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {versions.map((v, idx) => {
                      const versionId = v.id || v._id;

                      return (
                        <tr key={versionId} className="group hover:bg-slate-50/80 transition-all">
                          <td className="px-6 py-5 font-black text-slate-900">
                            v{v.versionNumber || versions.length - idx}
                          </td>

                          <td className="px-6 py-5 text-sm font-medium text-slate-600 italic">
                            "{v.commitMessage || "No documentation provided"}"
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                                {(v.uploadedBy?.name || "U").charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-600">{v.uploadedBy?.name || "System"}</span>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {formatDate(v.createdAt).split(',')[0]}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-4">
                              <button
                                onClick={() => handleDownload(versionId)}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                              >
                                Download
                              </button>

                              {idx !== 0 && (
                                <button
                                  onClick={() => handleRestore(versionId)}
                                  className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors"
                                >
                                  Restore
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {versions.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-20 text-center">
                          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                            Single instance document. No history recorded.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              <Card title="Collaboration Hub">
                <form
                  onSubmit={handleAddComment}
                  className="flex flex-col gap-4 mb-8"
                >
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Broadcast a comment..."
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50/50 focus:bg-white transition-all"
                  />

                  <button
                    disabled={commenting || !commentText.trim()}
                    className="h-11 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    Post Message
                  </button>
                </form>

                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                  {comments.map((comment) => {
                    const commentId = comment.id || comment._id;

                    return (
                      <div
                        key={commentId}
                        className="group relative border border-slate-100 rounded-[2rem] p-5 bg-white shadow-sm hover:border-blue-200 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                              {(comment.user?.name || comment.createdBy?.name || "U").charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-xs">
                                {comment.user?.name || comment.createdBy?.name || "System Operator"}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteComment(commentId)}
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                            title="Delete comment"
                          >
                            ×
                          </button>
                        </div>

                        <p className="text-sm text-slate-600 font-medium leading-relaxed pl-11">
                          {comment.comment || comment.message || comment.text}
                        </p>
                      </div>
                    );
                  })}

                  {comments.length === 0 && (
                    <div className="text-center py-10 opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        No transmissions found.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Activity Audit">
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {activities.map((activity) => (
                    <div
                      key={activity.id || activity._id}
                      className="flex items-start gap-4 border-l-2 border-slate-100 hover:border-blue-500 pl-6 py-2 transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          <span className="font-black text-slate-950">
                            {activity.user?.name || activity.userId?.name || "System"}
                          </span>{" "}
                          <span className="text-slate-500 lowercase font-bold tracking-tight">
                            {formatAction(activity.action)}
                          </span>
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 group-hover:text-blue-500 transition-colors">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div className="text-center py-10 opacity-40">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Zero activity logs.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <FilePreviewModal
        isOpen={isPreviewOpen}
        preview={preview}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreview(null);
        }}
      />
    </>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[32px] shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
        <h2 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em]">
          {title}
        </h2>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
      </div>

      <div className="p-6 sm:p-8 flex-1">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-[13px] py-1">
      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] shrink-0 pt-0.5">{label}</span>
      <span className="text-slate-900 font-black text-right break-words leading-tight">
        {value || "N/A"}
      </span>
    </div>
  );
}

function formatAction(action = "") {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}