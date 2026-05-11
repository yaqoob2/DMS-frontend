import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

import {
  LayoutDashboard,
  FolderOpen,
  Users,
  ShieldCheck,
  Activity,
  HardDrive,
  Search,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

const allNavItems = [
  { name: "Executive View", path: "/dashboard", icon: LayoutDashboard },
  { name: "Asset Vault", path: "/files", icon: FolderOpen },
  { name: "Personnel", path: "/users", icon: Users, roles: ["superadmin"] },
  { name: "Access Protocols", path: "/permissions", icon: ShieldCheck, roles: ["superadmin", "owner"] },
  { name: "Pulse Feed", path: "/activity", icon: Activity },
  { name: "System Metrics", path: "/storage", icon: HardDrive },
  { name: "Universal Search", path: "/search", icon: Search },
  { name: "Recovery Archive", path: "/trash", icon: Trash2 },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = allNavItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full bg-white select-none">
      <div className="h-[88px] border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
        {!collapsed || mobile ? (
          <>
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 shrink-0">
                D
              </div>
              <div className="overflow-hidden">
                <h1 className="text-[14px] font-black tracking-tighter text-slate-900 uppercase leading-none">
                  ConnectHub
                </h1>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 opacity-70">
                  Secure Repository
                </p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex w-9 h-9 rounded-xl hover:bg-slate-100 items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95"
            >
              <PanelLeftClose size={20} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all active:scale-95"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="w-12 h-12 rounded-2xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all active:scale-95"
            >
              <PanelLeftOpen size={22} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Navigation</p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : ""}
              onClick={() => setMobileOpen(false)}
            >
              {({ isActive }) => (
                <div
                  className={`flex items-center ${collapsed ? "justify-center" : "gap-4"}
      h-12 px-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300
      ${isActive
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/30"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 3 : 2.5} />

                  {!collapsed && (
                    <span className="truncate">
                      {item.name}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6">
        {!collapsed ? (
          <div className="rounded-[2rem] bg-slate-900 p-6 shadow-2xl shadow-slate-900/20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">
              Auth Status
            </p>
            <p className="text-xs font-bold text-white truncate">{user?.name || "Unidentified"}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">v1.2.0</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex h-screen sticky top-0 bg-white border-r border-slate-100 flex-col transition-all duration-500 ease-in-out z-40 ${collapsed ? "w-[100px]" : "w-[280px]"
          }`}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-500"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative h-full w-[86vw] max-w-[320px] bg-white flex flex-col shadow-[25px_0_50px_-12px_rgba(0,0,0,0.5)] transition-all animate-in slide-in-from-left duration-500 ease-out">
            <SidebarContent mobile />
          </aside>
        </div>
      )}
    </>
  );
}