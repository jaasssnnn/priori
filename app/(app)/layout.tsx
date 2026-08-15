import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { AppProvider } from "@/providers/AppProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex h-full min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col pl-60">
          <Topbar />
          <main className="flex-1 pt-14 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}
