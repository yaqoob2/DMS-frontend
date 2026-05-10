import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../api/services';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Total Files', value: '—', sub: 'Documents', icon: DocumentIcon, color: 'text-blue-500' },
    { label: 'Total Folders', value: '—', sub: 'Departments', icon: FolderIcon, color: 'text-indigo-500' },
    { label: 'Storage Used', value: '—', sub: 'Of 10 GB limit', icon: StorageIcon, color: 'text-amber-500' },
  ]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await storageService.getSummary();
        const data = res.data;

        setStats([
          { label: 'Total Files', value: data.fileCount || 0, sub: 'Active documents', icon: DocumentIcon, color: 'text-blue-500' },
          { label: 'Total Folders', value: data.folderCount || 0, sub: 'Organized collections', icon: FolderIcon, color: 'text-indigo-500' },
          { label: 'Storage Used', value: formatBytes(data.totalSize || 0), sub: `Used of ${formatBytes(data.limit || 10737418240)}`, icon: StorageIcon, color: 'text-amber-500' },
        ]);
      } catch (err) {
        console.error('Stats fetch failed');
      }
    }
    fetchSummary();
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Good day, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-slate-400">Welcome to the Private Company Document Repository.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 bg-slate-800 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</h3>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4">
          <DocumentIcon className="w-8 h-8" />
        </div>
        <p className="text-slate-400 font-medium">Repository Online</p>
        <p className="text-slate-600 text-sm mt-1">Visit the Files section to manage your documents.</p>
      </div>
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/* --- Icons --- */
function DocumentIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2} /></svg>; }
function FolderIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeWidth={2} /></svg>; }
function StorageIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4-3.582 4-8 4-8-1.79-8-4zm0 0v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7"
      />
    </svg>
  );
}
