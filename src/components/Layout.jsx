import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      {/* Background gradients for aesthetic */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-fintech-indigo/20 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fintech-emerald/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>

      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
