'use client';

import { useState, useEffect } from 'react';
import { getAllShiftsStats, GlobalShiftStats, clearAllLocalRecords } from '@/utils/db';

export default function AllShiftsStats() {
  const [stats, setStats] = useState<GlobalShiftStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptFilter, setAttemptFilter] = useState<'All' | 'Attempt 1' | 'Attempt 2'>('All');
  const [hasLocalCache, setHasLocalCache] = useState(false);

  async function loadStats() {
    try {
      const data = await getAllShiftsStats();
      // Only include PCM shifts
      const pcmData = data.filter(d => d.groupType === 'PCM');
      setStats(pcmData);

      // Check if local cache has records
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('cetify_local_scores');
        if (raw && JSON.parse(raw).length > 0) {
          setHasLocalCache(true);
        } else {
          setHasLocalCache(false);
        }
      }
    } catch (err) {
      console.error('Failed to load global shift stats:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearCache = () => {
    const success = clearAllLocalRecords();
    if (success) {
      setHasLocalCache(false);
      loadStats();
    }
  };

  const filteredStats = stats.filter(s => {
    return attemptFilter === 'All' || s.attempt === attemptFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Shift-wise Statistics
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time highest, lowest, and average marks compiled across all PCM shifts anonymously.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {hasLocalCache && (
            <button
              onClick={handleClearCache}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors border border-red-100"
              title="Clear all scores saved locally in your browser"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Local Cache
            </button>
          )}

          {/* Attempt Filters */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setAttemptFilter('All')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                attemptFilter === 'All'
                  ? 'bg-white text-[#4338ca] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setAttemptFilter('Attempt 1')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                attemptFilter === 'Attempt 1'
                  ? 'bg-white text-[#4338ca] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Attempt 1
            </button>
            <button
              onClick={() => setAttemptFilter('Attempt 2')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                attemptFilter === 'Attempt 2'
                  ? 'bg-white text-[#4338ca] shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Attempt 2
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        /* Loading Skeleton */
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredStats.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <svg className="w-8 h-8 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0012 20.25a11.38 11.38 0 00-3-.122v-.109m0-1.13c0-1.113-.285-2.16-.786-3.07M9 19.128a9.38 9.38 0 01-2.625.372 9.337 9.337 0 01-4.121-.952 4.125 4.125 0 017.533-2.493M9 19.128v-.003c0-1.113.285-2.16.786-3.07m0 0A3.375 3.375 0 009 18.128V18a3.375 3.375 0 01-3.375-3.375 3.375 3.375 0 013.375-3.375 3.375 3.375 0 013.375 3.375V18" />
          </svg>
          <p className="text-sm font-semibold text-gray-500">No shift statistics available yet</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Be the first to upload your response sheet and start compiling analytics!</p>
        </div>
      ) : (
        /* Statistics Table */
        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-6 sm:px-0">
            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Shift Details
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Attempt
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Highest
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Average
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Lowest
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredStats.map((s, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#0f172a]">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{s.examDate}</span>
                          <span className="text-gray-400 font-normal">· {s.shift}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-xs font-semibold text-gray-500">
                        {s.attempt}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-[#0f172a]">
                        {s.totalStudents}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-extrabold text-green-600">
                        {s.highestScore}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-extrabold text-[#4338ca]">
                        {s.averageScore}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-red-500">
                        {s.lowestScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
