'use client';

import { useState, useEffect } from 'react';
import { getAllShiftsStats, GlobalShiftStats } from '@/utils/db';
import { ShiftExplorerPanel } from './DeepAnalysis';
import { getAppConfig } from '@/utils/admin';

export default function AllShiftsStats() {
  const [stats, setStats] = useState<GlobalShiftStats[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      const config = await getAppConfig();
      const data = await getAllShiftsStats();
      let pcmData = data.filter(d => d.groupType === 'PCM');
      
      // If Attempt 1 is closed, only show Attempt 2 data in the Shift Explorer
      if (!config.attempt_1_open) {
        pcmData = pcmData.filter(d => d.attempt === 'Attempt 2');
      }
      
      setStats(pcmData);
    } catch (err) {
      console.error('Failed to load global shift stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a]">
          Shift Explorer
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Explore real-time averages and statistics for any shift anonymously.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-12 bg-gray-50 border border-gray-100 rounded-xl animate-pulse w-full sm:w-72" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : stats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm font-semibold text-gray-500">No shift statistics available yet</p>
        </div>
      ) : (
        <ShiftExplorerPanel globalStats={stats} />
      )}
    </div>
  );
}
