import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Topbar />

          <main className="flex-1 bg-slate-100 overflow-x-hidden overflow-y-auto pt-14 md:pt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}