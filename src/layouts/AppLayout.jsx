import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          <main className="flex-1 bg-slate-100 overflow-x-hidden overflow-y-auto pt-4 md:pt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}