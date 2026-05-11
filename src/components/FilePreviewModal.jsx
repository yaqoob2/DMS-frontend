export default function FilePreviewModal({ isOpen, onClose, preview }) {
    if (!isOpen || !preview) return null;

    const { previewUrl, previewType, fileName, canPreview } = preview;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm lg:left-[230px] flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white w-full max-w-[1040px] h-[86dvh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="h-14 px-4 sm:px-5 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <h2 className="text-base font-bold text-slate-900 truncate">
                                File Preview
                            </h2>

                            <span className="hidden sm:inline-flex px-2 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-700 uppercase">
                                {previewType}
                            </span>
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400 font-semibold truncate max-w-[220px] sm:max-w-[520px]">
                            {fileName}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:inline-flex h-9 px-4 items-center justify-center rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Download
                        </a>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-100 overflow-hidden">
                    {canPreview ? (
                        <>
                            {previewType === "pdf" && (
                                <iframe
                                    src={previewUrl}
                                    title="PDF Preview"
                                    className="w-full h-full border-0"
                                />
                            )}

                            {previewType === "image" && (
                                <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 overflow-auto">
                                    <img
                                        src={previewUrl}
                                        alt={fileName}
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                    />
                                </div>
                            )}

                            {previewType === "text" && (
                                <iframe
                                    src={previewUrl}
                                    title="Text Preview"
                                    className="w-full h-full border-0 bg-white"
                                />
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-5">
                                🚫
                            </div>

                            <h3 className="text-lg font-bold text-slate-900">
                                Preview unavailable
                            </h3>

                            <p className="text-sm text-slate-500 mt-2 max-w-sm">
                                This file type cannot be previewed directly. You can download it instead.
                            </p>

                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 h-10 px-5 rounded-lg bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center"
                            >
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}