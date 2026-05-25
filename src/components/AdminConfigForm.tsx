'use client';

import { useTransition, useState } from 'react';
import { saveAdminConfig } from '@/app/actions/adminActions';
import { AppConfig } from '@/utils/admin';

export default function AdminConfigForm({ config }: { config: AppConfig }) {
  const [isPending, startTransition] = useTransition();
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await saveAdminConfig(formData);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  return (
    <form action={handleSubmit} className="space-y-8 relative">
      {/* Master Kill Switch */}
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-red-900/30 relative overflow-hidden group hover:border-red-500/50 transition-colors">
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
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
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
        <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
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
      <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors">
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
        <button 
          type="submit" 
          disabled={isPending}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center min-w-[250px]"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Deploying to Edge...</span>
            </div>
          ) : (
            'Deploy Live Configuration'
          )}
        </button>
      </div>

      {/* Success Toast Overlay */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/90 backdrop-blur border border-emerald-400 text-white px-6 py-4 rounded-xl font-bold shadow-2xl shadow-emerald-500/20 animate-fade-in-up z-50 flex items-center gap-3">
          <div className="bg-white/20 p-1 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          System Live & Synced!
        </div>
      )}
    </form>
  );
}
