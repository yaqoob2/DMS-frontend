import { useState, useEffect, useCallback } from "react";
import toast from 'react-hot-toast';
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

      const [fileRes, versionsRes, commentsRes, activityRes] = await Promise.all([
        fileService.getById(id),
        fileService.getVersions(id).catch(() => ({ data: [] })),
        commentService.getByFile(id).catch(() => ({ data: [] })),
        activityService.getFileActivity(id).catch(() => ({ data: [] })),
      ]);

      setFile(fileRes.data?.file || fileRes.data?.data || fileRes.data);
      setVersions(Array.isArray(versionsRes.data) ? versionsRes.data : versionsRes.data?.versions || []);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : commentsRes.data?.comments || []);
      setActivities(
        Array.isArray(activityRes.data)
          ? activityRes.data
          : activityRes.data?.data || activityRes.data?.activities || activityRes.data?.logs || []
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
      setPreview(res.data?.data || res.data);
      setIsPreviewOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Preview failed.");
    }
  };

  const handleDownload = async (versionId = null) => {
    try {
      const res = versionId
        ? await fileService.downloadVersion(id, versionId)
        : await fileService.download(id);

      const downloadUrl = res.data?.downloadUrl || res.data?.url || res.data?.signedUrl || res.data;

      if (typeof downloadUrl === "string") window.open(downloadUrl, "_blank");
      else toast.error("Could not retrieve download link.");
    } catch {
      toast.error("Download failed.");
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
      toast.error(err.response?.data?.message || "Upload failed.");
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
      toast.error("Restore failed.");
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
      toast.error(err.response?.data?.message || "Comment failed.");
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
      toast.error("Delete comment failed.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
          Synchronising Repository...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 min-h-full flex items-center justify-center bg-[#f5f7fb]">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
            ⚠️
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Refused</h2>
          <p className="text-slate-500 font-medium mb-6 leading-relaxed">{error}</p>

          <Link
            to="/files"
            className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Return to Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-6 py-6 lg:py-5 bg-[#f5f7fb] min-h-full overflow-x-hidden">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-4">
          <Link to="/files" className="hover:text-blue-600 transition-colors">
            Files
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate max-w-[220px]">{fileName}</span>
        </nav>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-4 lg:px-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-slate-950 leading-tight break-words">
                {fileName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-bold text-blue-700 uppercase tracking-widest">
                  Version {file?.currentVersion?.versionNumber || file?.latestVersionNumber || 1}
                </span>

                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Updated {formatDate(file?.updatedAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={handlePreview}
                className="h-9 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm active:scale-95"
              >
                Preview
              </button>

              <button
                onClick={() => handleDownload()}
                className="h-9 px-4 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm active:scale-95"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 space-y-4">
            <Card title="File Overview">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <div className="h-[240px] lg:h-[300px] rounded-2xl border border-dashed border-slate-300 bg-white flex items-center justify-center">
                  <div className="text-center px-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto mb-3">
                      📄
                    </div>

                    <p className="font-bold text-slate-800 text-sm">
                      Document Preview
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Click preview to open the full file viewer
                    </p>

                    <button
                      onClick={handlePreview}
                      className="mt-4 h-9 px-4 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                    >
                      Open Preview
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="File Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <DetailRow label="Size" value={formatSize(file?.currentVersion?.size || file?.size)} />
                <DetailRow label="Type" value={file?.fileType || file?.extension || "Document"} />
                <DetailRow label="Owner" value={file?.uploadedBy?.name || "System"} />
                <DetailRow label="Folder" value={file?.folderId?.name || "Root Folder"} />
                <DetailRow label="Created" value={formatDate(file?.createdAt)} />
                <DetailRow label="Updated" value={formatDate(file?.updatedAt)} />
              </div>
            </Card>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <Card title="Upload New Version">
              <form onSubmit={handleUploadVersion} className="space-y-3">
                <input
                  type="file"
                  onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                  className="block w-full text-[10px] font-semibold text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-slate-600 hover:file:bg-blue-600 hover:file:text-white file:transition-all cursor-pointer"
                />

                <textarea
                  required
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Describe changes..."
                  className="w-full h-24 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-slate-50/60 focus:bg-white transition-all resize-none"
                />

                {uploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                      <span>Uploading</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <button
                  disabled={uploading || !newVersionFile || !commitMessage.trim()}
                  className="w-full h-10 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                >
                  {uploading ? "Uploading..." : "Push Version"}
                </button>
              </form>
            </Card>

            <Card title="Recent Activity">
              <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                {activities.map((activity) => (
                  <div
                    key={activity.id || activity._id}
                    className="border-l-2 border-slate-100 hover:border-blue-500 pl-3 py-1 transition-all group"
                  >
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      <span className="font-bold text-slate-950">
                        {activity.user?.name || activity.userId?.name || "System"}
                      </span>{" "}
                      <span className="text-slate-500 lowercase font-bold tracking-tight">
                        {formatAction(activity.action)}
                      </span>
                    </p>

                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 group-hover:text-blue-500 transition-colors">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="text-center py-8 opacity-40">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      No activity logs.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-4">
          <Card title="Version History">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[650px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-bold">
                    <th className="px-4 py-3 text-left">Version</th>
                    <th className="px-4 py-3 text-left">Message</th>
                    <th className="px-4 py-3 text-left">Author</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {versions.map((v, idx) => {
                    const versionId = v.id || v._id;

                    return (
                      <tr key={versionId} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-4 py-3 font-bold text-xs text-slate-900">
                          v{v.versionNumber || versions.length - idx}
                        </td>

                        <td className="px-4 py-3 text-xs font-medium text-slate-600">
                          {v.commitMessage || "No message"}
                        </td>

                        <td className="px-4 py-3 text-xs font-bold text-slate-600">
                          {v.uploadedBy?.name || "System"}
                        </td>

                        <td className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatDate(v.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleDownload(versionId)}
                              className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                            >
                              Download
                            </button>

                            {idx !== 0 && (
                              <button
                                onClick={() => handleRestore(versionId)}
                                className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors"
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
                      <td colSpan="5" className="py-10 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                          No version history recorded.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <Card title="Comments">
            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />

              <button
                disabled={commenting || !commentText.trim()}
                className="h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                Post
              </button>
            </form>

            <div className="space-y-3">
              {comments.map((comment) => {
                const commentId = comment.id || comment._id;

                return (
                  <div
                    key={commentId}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-white hover:border-blue-100 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {comment.user?.name || comment.createdBy?.name || "System"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteComment(commentId)}
                        className="text-red-500 text-xs font-bold hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>

                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      {comment.comment || comment.message || comment.text}
                    </p>
                  </div>
                );
              })}

              {comments.length === 0 && (
                <div className="text-center py-8 opacity-40">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    No comments yet.
                  </p>
                </div>
              )}
            </div>
          </Card>
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-[10px] uppercase tracking-[0.12em]">
          {title}
        </h2>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
      </div>

      <div className="p-3.5 flex-1">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs py-1">
      <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-slate-900 font-bold text-right break-words leading-tight">
        {value || "N/A"}
      </span>
    </div>
  );
}

function formatAction(action = "") {
  return action.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}