import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col">
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}