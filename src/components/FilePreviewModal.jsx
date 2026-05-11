export default function FilePreviewModal({
    isOpen,
    onClose,
    preview,
}) {
    if (!isOpen || !preview) return null;

    const {
        previewUrl,
        previewType,
        fileName,
        canPreview,
    } = preview;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[40px] overflow-hidden shadow-2xl shadow-slate-900/40 flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 sm:px-10 border-b border-slate-50 bg-slate-50/50">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            Asset <span className="text-blue-600">Inspection</span>
                            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-blue-50 text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100">
                                {previewType?.toUpperCase()}
                            </span>
                        </h2>

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 truncate">
                            {fileName}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:flex h-12 px-6 items-center justify-center rounded-2xl bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                        >
                            Download Asset
                        </a>

                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-slate-100 relative overflow-hidden">
                    {canPreview ? (
                        <div className="w-full h-full">
                            {previewType === 'pdf' && (
                                <iframe
                                    src={previewUrl}
                                    title="PDF Preview"
                                    className="w-full h-full border-0"
                                />
                            )}

                            {previewType === 'image' && (
                                <div className="w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-auto">
                                    <img
                                        src={previewUrl}
                                        alt={fileName}
                                        className="max-w-full max-h-full rounded-3xl shadow-2xl shadow-slate-900/20 object-contain animate-in fade-in zoom-in-90 duration-500"
                                    />
                                </div>
                            )}

                            {previewType === 'text' && (
                                <div className="w-full h-full bg-white overflow-auto p-8 sm:p-12">
                                    <iframe
                                        src={previewUrl}
                                        title="Text Preview"
                                        className="w-full h-full border-0 bg-white rounded-2xl"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-slate-200 mb-8 animate-bounce">
                                🚫
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                                Visual Override <span className="text-red-600">Unavailable</span>
                            </h3>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 max-w-xs">
                                The encryption or format of this asset prevents direct terminal rendering.
                            </p>

                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="h-14 px-10 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center"
                            >
                                Extract Payload (Download)
                            </a>
                        </div>
                    )}
                </div>
                
                {/* Footer Status Bar */}
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Viewer Active</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Terminal Ver: 2.4.0-RESPONSIVE</span>
                </div>
            </div>
        </div>
    );
}