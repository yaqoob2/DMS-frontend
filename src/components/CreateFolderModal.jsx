import { useState } from 'react';

export default function CreateFolderModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Folder name is required');
            return;
        }

        try {
            setCreating(true);
            await onCreate(name.trim());
            setName('');
            onClose();
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center px-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-900/20 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 sm:px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            Create <span className="text-blue-600">Sector</span>
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">
                            Sector Initialisation
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all shadow-sm"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 sm:px-10 sm:pb-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                            Sector Identity (Folder Name)
                        </label>

                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                                📁
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Example: Legal Records"
                                className="w-full pl-14 pr-5 h-16 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={creating}
                            className="flex-2 h-14 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 disabled:opacity-60 transition-all shadow-xl shadow-blue-600/25 active:scale-95 px-8"
                        >
                            {creating ? 'Initialising...' : 'Deploy Sector'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}