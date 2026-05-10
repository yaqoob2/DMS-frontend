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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Preview
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 truncate">
                            {fileName}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-500"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 bg-slate-100 overflow-auto">
                    {canPreview ? (
                        <>
                            {previewType === 'pdf' && (
                                <iframe
                                    src={previewUrl}
                                    title="PDF Preview"
                                    className="w-full h-full border-0"
                                />
                            )}

                            {previewType === 'image' && (
                                <div className="w-full h-full flex items-center justify-center p-8">
                                    <img
                                        src={previewUrl}
                                        alt={fileName}
                                        className="max-w-full max-h-full rounded-xl shadow-lg"
                                    />
                                </div>
                            )}

                            {previewType === 'text' && (
                                <iframe
                                    src={previewUrl}
                                    title="Text Preview"
                                    className="w-full h-full border-0 bg-white"
                                />
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="text-6xl mb-4">📄</div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Preview Not Available
                            </h3>

                            <p className="text-slate-500 mb-6">
                                This file type cannot be previewed directly.
                            </p>

                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
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