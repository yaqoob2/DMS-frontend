import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  ShieldCheck,
  Activity,
  HardDrive,
  Search,
  Trash2,
  ChevronLeft,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Files", path: "/files", icon: FolderOpen },
  { name: "Users", path: "/users", icon: Users },
  { name: "Permissions", path: "/permissions", icon: ShieldCheck },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Storage", path: "/storage", icon: HardDrive },
  { name: "Search", path: "/search", icon: Search },
  { name: "Deleted Files", path: "/trash", icon: Trash2 },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/30 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-30
          h-[100dvh]
          ${collapsed ? "lg:w-[76px]" : "lg:w-[230px]"}
          w-[230px]
          bg-white border-r border-slate-200
          flex flex-col shrink-0
          transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-14 px-3 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              D
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-950 leading-none truncate">
                  ConnectHub
                </h1>
                <p className="mt-1 text-[9px] text-slate-500 font-semibold uppercase tracking-[0.12em] truncate">
                  Repository
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={17} strokeWidth={2.25} />
          </button>

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="hidden lg:flex w-8 h-8 rounded-md items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={17}
              strokeWidth={2.25}
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  title={collapsed ? item.name : ""}
                  className={({ isActive }) =>
                    `
                    group flex items-center ${collapsed ? "justify-center px-0" : "gap-2.5 px-3"
                    } py-2 rounded-lg
                    text-sm font-semibold
                    transition-colors duration-150
                    ${isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent"
                    }
                  `
                  }
                >
                  <Icon size={17} strokeWidth={2.1} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="px-2.5 py-3 border-t border-slate-200 shrink-0">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-900">
                {(user?.name || "U").charAt(0)}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                Signed in as
              </p>

              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {user?.name || "Member User"}
                </p>

                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>

              <p className="mt-2 text-[10px] text-slate-400 font-medium">
                Version 1.2.0
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}