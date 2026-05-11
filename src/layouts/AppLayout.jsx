import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
      <div className="flex min-h-screen relative overflow-x-hidden">
        {/* Sidebar wrapper */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full relative z-0">
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            {/* Page content wrapper with responsive padding */}
            <div className="min-h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}