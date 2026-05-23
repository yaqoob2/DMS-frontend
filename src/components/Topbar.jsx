import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, Search, Settings } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const profileImageUrl =
    user?.profileImageUrl && !imageFailed ? user.profileImageUrl : null;

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const cleanQuery = searchTerm.trim();
    if (!cleanQuery) return;

    navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
    setSearchTerm("");
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 selection:bg-blue-100 shrink-0">
      <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-900 transition-all active:scale-95 border border-slate-100 shadow-sm shrink-0"
            >
              <Menu size={18} strokeWidth={2.5} />
            </button>

            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 tracking-tight truncate">
                ConnectHub
              </p>
              <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.18em]">
                Secure Repository
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-[360px]">
            <form onSubmit={handleSearch} className="relative group w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                strokeWidth={3}
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files and folders..."
                className="w-full h-10 bg-slate-50/50 border border-slate-100 text-slate-900 text-[13px] font-bold rounded-2xl pl-11 pr-4 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button className="w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all relative border border-transparent hover:border-slate-100">
              <Bell size={17} strokeWidth={2.5} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button className="hidden sm:flex w-9 h-9 rounded-xl hover:bg-slate-50 items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
              <Settings size={17} strokeWidth={2.5} />
            </button>

            <div className="hidden md:block h-7 w-px bg-slate-100"></div>

            <div className="hidden md:block text-right max-w-[130px]">
              <p className="text-[12px] font-black text-slate-900 tracking-tight leading-none truncate">
                {user?.name || "Member User"}
              </p>
              <p className="text-[8px] text-blue-600 font-black uppercase tracking-[0.18em] mt-1 opacity-80 truncate">
                {user?.role || "ACCESS LEVEL 1"}
              </p>
            </div>

            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-base shadow-lg shadow-slate-900/10 overflow-hidden ring-2 ring-white border border-slate-200">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={user?.name || "Profile"}
                    onError={() => setImageFailed(true)}
                    className="w-full h-full object-cover object-center"
                    draggable="false"
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 border border-transparent hover:border-red-100"
              title="Logout"
            >
              <LogOut size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="hidden sm:block lg:hidden mt-2">
          <form onSubmit={handleSearch} className="relative group w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              strokeWidth={3}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files and folders..."
              className="w-full h-10 bg-slate-50/50 border border-slate-100 text-slate-900 text-[13px] font-bold rounded-xl pl-11 pr-4 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400"
            />
          </form>
        </div>
      </div>
    </header>
  );
}