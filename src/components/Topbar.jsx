import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, Search } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-4 md:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:block flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />

            <input
              type="text"
              placeholder="Search documents..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <button className="sm:hidden w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Search size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="hidden md:block h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block text-right max-w-[130px]">
            <p className="text-sm font-semibold text-slate-800 leading-none truncate">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </p>

            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 truncate">
              {user?.role || "Member"}
            </p>
          </div>

          <div className="relative shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white ring-offset-2 ring-offset-slate-100">
              {user?.name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>

          <button
            onClick={handleLogout}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}