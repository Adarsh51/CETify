import { getAppConfig } from '@/utils/admin';
import { logout } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import AdminConfigForm from '@/components/AdminConfigForm';

export default async function AdminDashboard() {
  const config = await getAppConfig();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-sans selection:bg-red-500">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              CETify Command Center
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-2">God-Mode Dashboard</p>
          </div>
          <form action={logout}>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-bold rounded-lg border border-gray-700 transition-colors">
              Disconnect
            </button>
          </form>
        </header>

        <AdminConfigForm config={config} />
      </div>
    </div>
  );
}
