import { getAppConfig } from '@/utils/admin';
import { saveAdminConfig } from '@/app/actions/adminActions';
import { logout } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

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

        <form action={saveAdminConfig} className="space-y-8">
          {/* Master Kill Switch */}
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-red-900/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Master Kill-Switch (Maintenance Mode)
                </h2>
                <p className="text-gray-400 text-sm mt-1">If enabled, the entire live site is replaced with a "System Upgrading" screen.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="maintenance_mode" defaultChecked={config.maintenance_mode} className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attempt 1 Toggle */}
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Attempt 1 (April)</h3>
                  <p className="text-gray-400 text-sm mt-1">Allow submissions for the April session.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="attempt_1_open" defaultChecked={config.attempt_1_open} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Attempt 2 Toggle */}
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Attempt 2 (May)</h3>
                  <p className="text-gray-400 text-sm mt-1">Allow submissions for the May session.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="attempt_2_open" defaultChecked={config.attempt_2_open} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Megaphone Banner */}
          <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-2xl">📢</span> Live Site Banner Controller
            </h3>
            <p className="text-gray-400 text-sm mb-4">Type a message here and it instantly appears as a sticky alert banner on the main dashboard. Leave blank to hide.</p>
            <input 
              type="text" 
              name="banner_message" 
              defaultValue={config.banner_message}
              placeholder="e.g. Servers are currently under heavy load..." 
              className="w-full bg-[#0f172a] border border-gray-700 text-white py-4 px-4 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20">
              Deploy Live Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
