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
  Menu,
  X,
} from "lucide-react";

const allNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Files", path: "/files", icon: FolderOpen },
  { name: "Users", path: "/users", icon: Users, roles: ["superadmin"] },
  { name: "Permissions", path: "/permissions", icon: ShieldCheck, roles: ["superadmin", "owner"] },
  { name: "Activity", path: "/activity", icon: Activity },
  { name: "Storage", path: "/storage", icon: HardDrive },
  { name: "Search", path: "/search", icon: Search },
  { name: "Deleted Items", path: "/trash", icon: Trash2 },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = allNavItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  const SidebarContent = () => (
    <>
      <div className="h-[74px] border-b border-slate-200 flex items-center justify-between px-4">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-xl object-cover" />
              <div className="overflow-hidden">
                <h1 className="text-[15px] font-semibold text-slate-900 truncate">
                  DMS ConnectHub
                </h1>
                <p className="text-[11px] text-slate-500 truncate">
                  Document Repository
                </p>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="hidden md:flex w-8 h-8 rounded-lg hover:bg-slate-100 items-center justify-center text-slate-500"
            >
              <PanelLeftClose size={18} />
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : ""}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? "justify-center" : "gap-3"}
                h-11 px-3 rounded-xl text-[14px] font-medium transition-all
                ${isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} strokeWidth={2.2} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        {!collapsed ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              DMS
            </p>
            <p className="text-xs text-slate-600 mt-0.5">v1.2.0-beta</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden md:flex h-screen sticky top-0 bg-white border-r border-slate-200 flex-col transition-all duration-300 ${collapsed ? "w-[78px]" : "w-[220px]"
          }`}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative w-[280px] max-w-[85%] h-full bg-white border-r border-slate-200 flex flex-col shadow-2xl transition-transform animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}