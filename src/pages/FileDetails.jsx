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
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 bg-slate-100 min-h-screen">
        <div className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md mx-auto text-center shadow-sm">
          <p className="text-red-600 font-medium mb-4">{error}</p>

          <Link to="/files" className="text-blue-600 hover:underline text-sm">
            Back to Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-slate-100 min-h-full text-slate-900 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <nav className="flex flex-wrap items-center gap-2 text-[12px] sm:text-sm text-slate-500 mb-6">
            <Link to="/files" className="hover:text-blue-600">
              Files
            </Link>

            <span>/</span>

            <span className="text-slate-800 break-words">{fileName}</span>
          </nav>

          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[22px] sm:text-2xl font-bold text-slate-950 break-words">
                {fileName}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Current version: v
                {file?.currentVersion?.versionNumber ||
                  file?.latestVersionNumber ||
                  1}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePreview}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Preview
              </button>

              <button
                onClick={() => handleDownload()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
              >
                Download Current
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card title="File Information">
                <div className="space-y-3">
                  <DetailRow
                    label="Size"
                    value={formatSize(file?.currentVersion?.size || file?.size)}
                  />

                  <DetailRow
                    label="Type"
                    value={file?.fileType || file?.extension || "Document"}
                  />

                  <DetailRow
                    label="Owner"
                    value={file?.uploadedBy?.name || "User"}
                  />

                  <DetailRow
                    label="Folder"
                    value={file?.folderId?.name || "Root"}
                  />

                  <DetailRow label="Created" value={formatDate(file?.createdAt)} />

                  <DetailRow label="Updated" value={formatDate(file?.updatedAt)} />
                </div>
              </Card>

              <Card title="Upload New Version">
                <form onSubmit={handleUploadVersion} className="space-y-4">
                  <input
                    type="file"
                    onChange={(e) =>
                      setNewVersionFile(e.target.files?.[0] || null)
                    }
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-slate-300"
                  />

                  <textarea
                    required
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Commit message..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />

                  {uploading && (
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  <button
                    disabled={uploading || !newVersionFile || !commitMessage.trim()}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold"
                  >
                    {uploading ? "Uploading..." : "Submit New Version"}
                  </button>
                </form>
              </Card>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <Card title="Version History">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="text-xs uppercase text-slate-500 border-b">
                      <tr>
                        <th className="py-3 px-2 text-left">Version</th>
                        <th className="py-3 px-2 text-left">Commit</th>
                        <th className="py-3 px-2 text-left">By</th>
                        <th className="py-3 px-2 text-left">Date</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {versions.map((v, idx) => {
                        const versionId = v.id || v._id;

                        return (
                          <tr key={versionId}>
                            <td className="py-3 px-2 font-semibold">
                              v{v.versionNumber || versions.length - idx}
                            </td>

                            <td className="py-3 px-2 text-slate-600">
                              {v.commitMessage || "No commit message"}
                            </td>

                            <td className="py-3 px-2 text-slate-600">
                              {v.uploadedBy?.name || "User"}
                            </td>

                            <td className="py-3 px-2 text-slate-500">
                              {formatDate(v.createdAt)}
                            </td>

                            <td className="py-3 px-2">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  onClick={() => handleDownload(versionId)}
                                  className="text-blue-600 hover:underline"
                                >
                                  Download
                                </button>

                                {idx !== 0 && (
                                  <button
                                    onClick={() => handleRestore(versionId)}
                                    className="text-amber-600 hover:underline"
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
                          <td
                            colSpan="5"
                            className="py-8 text-center text-slate-500"
                          >
                            No versions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title="Comments">
                <form
                  onSubmit={handleAddComment}
                  className="flex flex-col sm:flex-row gap-3 mb-5"
                >
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    disabled={commenting || !commentText.trim()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-3">
                  {comments.map((comment) => {
                    const commentId = comment.id || comment._id;

                    return (
                      <div
                        key={commentId}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm break-words">
                              {comment.user?.name ||
                                comment.createdBy?.name ||
                                "User"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteComment(commentId)}
                            className="text-xs text-red-500 hover:underline shrink-0"
                          >
                            Delete
                          </button>
                        </div>

                        <p className="text-sm text-slate-700 mt-3 break-words">
                          {comment.comment || comment.message || comment.text}
                        </p>
                      </div>
                    );
                  })}

                  {comments.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">
                      No comments yet.
                    </p>
                  )}
                </div>
              </Card>

              <Card title="Activity History">
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id || activity._id}
                      className="flex items-start gap-3 border border-slate-200 rounded-xl p-4 bg-slate-50"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />

                      <div className="min-w-0">
                        <p className="text-sm text-slate-800 break-words">
                          <span className="font-semibold">
                            {activity.user?.name ||
                              activity.userId?.name ||
                              "User"}
                          </span>{" "}
                          {formatAction(activity.action)}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-6">
                      No activity yet.
                    </p>
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-900 text-[15px] sm:text-base">
          {title}
        </h2>
      </div>

      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>

      <span className="text-slate-800 font-medium text-right break-words">
        {value || "—"}
      </span>
    </div>
  );
}

function formatAction(action = "") {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}