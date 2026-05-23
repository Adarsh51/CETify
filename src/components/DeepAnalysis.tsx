'use client';

import React, { useState, useMemo } from 'react';
import { CalculationResult, ParseResult } from '@/types';
import { ShiftStats, GlobalShiftStats } from '@/utils/db';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface DeepAnalysisProps {
  result: CalculationResult;
  meta: ParseResult['meta'];
  questions: ParseResult['questions'];
  shiftStats: ShiftStats | null;
  globalStats: GlobalShiftStats[] | null;
  attempt: string;
  examDate: string;
  shift: string;
  groupType: 'PCM' | 'PCB';
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function DeepAnalysis({
  result, meta, questions, shiftStats, globalStats,
  attempt, examDate, shift, groupType
}: DeepAnalysisProps) {

  const percentile = shiftStats
    ? ((shiftStats.behindCount / Math.max(shiftStats.totalStudents, 1)) * 100).toFixed(1)
    : '0.0';

  /* ── derived chart data ── */
  const {
    histogramData, crossShiftData, entriesData, currentGlobal,
    relatedShifts, topperData, averageData, subjectShiftData,
    toughestShift, easiestShift, totalGlobalEntries
  } = useMemo(() => {
    if (!globalStats) return {
      histogramData: [], crossShiftData: [], entriesData: [], currentGlobal: null,
      relatedShifts: [], topperData: [], averageData: [], subjectShiftData: [],
      toughestShift: null, easiestShift: null, totalGlobalEntries: 0
    };

    const current = globalStats.find(s =>
      s.shift === shift && s.examDate === examDate && s.groupType === groupType && s.attempt === attempt
    );

    // histogram buckets
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * 20}-${(i + 1) * 20}`, count: 0
    }));
    let userBucketIdx = -1;
    if (current?.scoresList) {
      current.scoresList.forEach(score => {
        let b = Math.floor(score / 20);
        if (b >= 10) b = 9;
        buckets[b].count++;
      });
      userBucketIdx = Math.min(Math.floor(result.totalMarks / 20), 9);
    }
    const histData = buckets.map((b, i) => ({ name: b.label, count: b.count, isUser: i === userBucketIdx }));

    // related shifts for this attempt+group
    const related = globalStats.filter(s => s.groupType === groupType && s.attempt === attempt);

    // cross-shift averages
    const crossData = related.map(s => ({
      name: `${s.examDate.replace('April ', '').replace('May ', '')} ${s.shift === 'Shift 1' ? 'S1' : 'S2'}`,
      average: s.averageScore,
      isCurrent: s.shift === shift && s.examDate === examDate
    }));

    // topper data per shift
    const tData = related.map(s => ({
      name: `${s.examDate.replace('April ', '').replace('May ', '')} ${s.shift === 'Shift 1' ? 'S1' : 'S2'}`,
      topper: s.highestScore,
      isCurrent: s.shift === shift && s.examDate === examDate
    }));

    // average data per shift
    const aData = related.map(s => ({
      name: `${s.examDate.replace('April ', '').replace('May ', '')} ${s.shift === 'Shift 1' ? 'S1' : 'S2'}`,
      average: s.averageScore,
      isCurrent: s.shift === shift && s.examDate === examDate
    }));

    // subject-wise per-shift comparison
    const subData = related.map(s => ({
      name: `${s.examDate.replace('April ', '').replace('May ', '')} ${s.shift === 'Shift 1' ? 'S1' : 'S2'}`,
      physics: s.physicsAvg,
      chemistry: s.chemistryAvg,
      maths: s.mathsAvg,
    }));

    // entries pie for same-day shifts
    const sameDayShifts = related.filter(s => s.examDate === examDate);
    const eData = sameDayShifts.map(s => ({ name: s.shift, value: s.totalStudents }));

    // toughest / easiest
    const sorted = [...related].sort((a, b) => a.averageScore - b.averageScore);
    const tough = sorted.length > 0 ? sorted[0] : null;
    const easy = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    const totalEntries = related.reduce((sum, s) => sum + s.totalStudents, 0);

    return {
      histogramData: histData, crossShiftData: crossData, entriesData: eData,
      currentGlobal: current, relatedShifts: related,
      topperData: tData, averageData: aData, subjectShiftData: subData,
      toughestShift: tough, easiestShift: easy, totalGlobalEntries: totalEntries
    };
  }, [globalStats, shift, examDate, groupType, attempt, result.totalMarks]);

  /* ── radar data for subject comparison ── */
  const radarData = useMemo(() => {
    if (!currentGlobal) return [];
    return [
      { subject: 'Physics', you: result.physics.marks, avg: currentGlobal.physicsAvg },
      { subject: 'Chemistry', you: result.chemistry.marks, avg: currentGlobal.chemistryAvg },
      { subject: 'Maths', you: result.maths.marks, avg: currentGlobal.mathsAvg },
    ];
  }, [result, currentGlobal]);

  const [shiftCompTab, setShiftCompTab] = useState<'topper' | 'average'>('topper');

  const PIE_COLORS = ['#f43f5e', '#6366f1'];

  /* ════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════ */
  return (
    <div className="w-full bg-[#0b1120] text-white rounded-2xl overflow-hidden font-sans">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="px-6 sm:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Shift-wise Live Analysis</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time competitor analytics powered by anonymous submissions</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Data
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/25">
              {totalGlobalEntries} total submissions
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-8 space-y-10">

        {/* ═══════════ SECTION 01 — YOUR POSITION ═══════════ */}
        {shiftStats && (
          <section>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Section 01</p>
            <h3 className="text-lg font-bold text-white mb-5">Your Position in Your Shift</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Big Rank */}
              <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40 flex flex-col items-center justify-center sm:row-span-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Shift Rank</p>
                <p className="text-6xl sm:text-7xl font-black text-rose-500 leading-none">
                  #{shiftStats.aheadCount + 1}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">
                  Out of {shiftStats.totalStudents} students
                </p>
                <p className="text-xs text-slate-500 mt-4 text-center leading-relaxed">
                  You scored higher than {shiftStats.behindCount} students<br/>(Top {percentile}%).
                </p>
              </div>

              {/* Students Ahead */}
              <StatCard icon="arrow-up" iconBg="bg-emerald-500/15" iconColor="text-emerald-400"
                value={shiftStats.aheadCount} label="Students Ahead of You" />
              {/* Shift Average */}
              <StatCard icon="chart" iconBg="bg-amber-500/15" iconColor="text-amber-400"
                value={shiftStats.averageScore} label="Shift Average Score" />
              {/* Same Score */}
              <StatCard icon="equals" iconBg="bg-blue-500/15" iconColor="text-blue-400"
                value={Math.max(0, shiftStats.totalStudents - shiftStats.aheadCount - shiftStats.behindCount - 1)}
                label="Same Score as You" />
              {/* Highest */}
              <StatCard icon="star" iconBg="bg-fuchsia-500/15" iconColor="text-fuchsia-400"
                value={shiftStats.highestScore} label="Highest Score in Shift" />
              {/* Below */}
              <StatCard icon="arrow-down" iconBg="bg-rose-500/15" iconColor="text-rose-400"
                value={shiftStats.behindCount} label="Students Below You" />
              {/* Total */}
              <StatCard icon="users" iconBg="bg-emerald-500/15" iconColor="text-emerald-400"
                value={shiftStats.totalStudents} label="Total Shift Participants" />
            </div>

            {/* Score Comparison — You vs Shift */}
            <div className="mt-6 bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-5">Score Comparison — You vs Shift</h4>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Your Score', value: result.totalMarks },
                      { name: 'Shift Average', value: shiftStats.averageScore },
                      { name: 'Shift Highest', value: shiftStats.highestScore },
                    ]}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} domain={[0, 200]} />
                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={darkTooltipStyle} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={100}>
                      <Cell fill="#f43f5e" />
                      <Cell fill="#38bdf8" />
                      <Cell fill="#c084fc" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ SECTION 02 — SUBJECT-WISE PERFORMANCE ═══════════ */}
        {currentGlobal && (
          <section>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Section 02</p>
            <h3 className="text-lg font-bold text-white mb-5">Subject-wise Performance in Your Shift</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Radar Chart */}
              <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <PolarRadiusAxis tick={{ fontSize: 10, fill: '#475569' }} />
                      <Radar name="You" dataKey="you" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} strokeWidth={2} />
                      <Radar name="Shift Avg" dataKey="avg" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} strokeWidth={2} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Horizontal Subject Bars */}
              <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40 flex flex-col justify-center space-y-5">
                {[
                  { name: 'Physics', yours: result.physics.marks, max: result.physics.maxMarks, avg: currentGlobal.physicsAvg, color: '#f43f5e' },
                  { name: 'Chemistry', yours: result.chemistry.marks, max: result.chemistry.maxMarks, avg: currentGlobal.chemistryAvg, color: '#38bdf8' },
                  { name: 'Mathematics', yours: result.maths.marks, max: result.maths.maxMarks, avg: currentGlobal.mathsAvg, color: '#c084fc' },
                ].map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="text-white">{s.yours} / {s.max}</span>
                    </div>
                    {/* Your score bar */}
                    <div className="w-full bg-[#1e293b] rounded-full h-2.5 mb-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(s.yours / s.max) * 100}%`, backgroundColor: s.color }} />
                    </div>
                    {/* Avg bar */}
                    <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full opacity-40" style={{ width: `${(s.avg / s.max) * 100}%`, backgroundColor: s.color }} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Shift Avg: {s.avg}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ SCORE DISTRIBUTION HISTOGRAM ═══════════ */}
        <section>
          <h3 className="text-lg font-bold text-white mb-5">Score Distribution — Your Shift</h3>
          <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={darkTooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {histogramData.map((entry, i) => (
                      <Cell key={i} fill={entry.isUser ? '#f43f5e' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">
              Your score range highlighted: {Math.floor(result.totalMarks / 20) * 20}-{(Math.floor(result.totalMarks / 20) + 1) * 20}
            </p>
          </div>
        </section>

        {/* ═══════════ CROSS-SHIFT COMPARISON (horizontal bars) ═══════════ */}
        <section>
          <h3 className="text-lg font-bold text-white mb-5">Cross-Shift Comparison</h3>
          <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crossShiftData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 10']} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={50} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={darkTooltipStyle} />
                  <Bar dataKey="average" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {crossShiftData.map((entry, i) => (
                      <Cell key={i} fill={entry.isCurrent ? '#f43f5e' : '#38bdf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ═══════════ TOPPER & AVERAGE TABS ═══════════ */}
        <section>
          <h3 className="text-lg font-bold text-white mb-4">Shift-wise Scores</h3>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setShiftCompTab('topper')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${shiftCompTab === 'topper' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#131b2e] text-slate-400 border border-slate-700/40 hover:text-slate-200'}`}>
              Topper Scores
            </button>
            <button onClick={() => setShiftCompTab('average')} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${shiftCompTab === 'average' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-[#131b2e] text-slate-400 border border-slate-700/40 hover:text-slate-200'}`}>
              Average Scores
            </button>
          </div>
          <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(shiftCompTab === 'topper' ? topperData : averageData) as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={darkTooltipStyle} />
                  <Bar dataKey={shiftCompTab === 'topper' ? 'topper' : 'average'} radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {((shiftCompTab === 'topper' ? topperData : averageData) as any[]).map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.isCurrent ? '#f43f5e' : (shiftCompTab === 'topper' ? '#38bdf8' : '#c084fc')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ═══════════ SUBJECT-WISE SHIFT COMPARISON (grouped bars) ═══════════ */}
        <section>
          <h3 className="text-lg font-bold text-white mb-5">Subject-wise Shift Comparison</h3>
          <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectShiftData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={darkTooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="physics" name="Physics" fill="#f43f5e" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="chemistry" name="Chemistry" fill="#38bdf8" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="maths" name="Maths" fill="#c084fc" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ═══════════ SHIFT EXPLORER — DRILL DOWN ═══════════ */}
        {relatedShifts.length > 0 && (
          <ShiftExplorerPanel globalStats={relatedShifts} />
        )}

        {/* ═══════════ SHIFT DIFFICULTY ANALYSIS ═══════════ */}
        {toughestShift && easiestShift && (
          <section>
            <h3 className="text-lg font-bold text-white mb-5">Shift Difficulty Analysis</h3>
            <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40 space-y-6">
              {/* AI insight box */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">CETify Difficulty Insights</h4>
                  <p className="text-xs text-slate-400 mb-3">AI-powered shift difficulty breakdown</p>
                  <div className="bg-[#0b1120] rounded-lg p-4 border border-slate-700/40 text-sm text-slate-300 leading-relaxed">
                    <p>Based on <strong className="text-white">{totalGlobalEntries}</strong> submissions, the toughest shift is <strong className="text-rose-400">{toughestShift.examDate} {toughestShift.shift}</strong> with an average of <strong className="text-white">{toughestShift.averageScore}</strong>, while the easiest shift is <strong className="text-emerald-400">{easiestShift.examDate} {easiestShift.shift}</strong> with an average of <strong className="text-white">{easiestShift.averageScore}</strong>.</p>
                  </div>
                </div>
              </div>

              {/* Toughest & Easiest cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-5">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">🔴 Toughest Shift</p>
                  <p className="text-lg font-bold text-white">{toughestShift.examDate} — {toughestShift.shift}</p>
                  <p className="text-sm text-slate-400 mt-1">Avg Score: <strong className="text-white">{toughestShift.averageScore}</strong> · Topper: <strong className="text-white">{toughestShift.highestScore}</strong></p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">🟢 Easiest Shift</p>
                  <p className="text-lg font-bold text-white">{easiestShift.examDate} — {easiestShift.shift}</p>
                  <p className="text-sm text-slate-400 mt-1">Avg Score: <strong className="text-white">{easiestShift.averageScore}</strong> · Topper: <strong className="text-white">{easiestShift.highestScore}</strong></p>
                </div>
              </div>

              {/* Difficulty Ranking Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Shift</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Avg Score</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Topper</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...relatedShifts].sort((a, b) => a.averageScore - b.averageScore).map((s, i) => (
                      <tr key={i} className={`border-b border-slate-800/50 ${s.examDate === examDate && s.shift === shift ? 'bg-indigo-500/10' : ''}`}>
                        <td className="px-4 py-3 font-bold text-slate-400">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-white">{s.examDate} {s.shift}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">{s.averageScore}</td>
                        <td className="px-4 py-3 font-mono text-fuchsia-400">{s.highestScore}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-400">{s.totalStudents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════ OVERALL ENTRIES OVERVIEW (Donut) ═══════════ */}
        <section>
          <h3 className="text-lg font-bold text-white mb-5">Overall Entries Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={entriesData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {entriesData.map((_, i) => <PieCell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={darkTooltipStyle} formatter={(value: any) => [value, 'Students']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40 flex flex-col justify-center space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Entries</p>
                <p className="text-4xl font-black text-rose-500">{totalGlobalEntries}</p>
              </div>
              {entriesData.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm text-slate-300 font-semibold">{e.name}: <strong className="text-white">{e.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   HELPER: Dark Tooltip Style
   ════════════════════════════════════════════════════════════════ */
const darkTooltipStyle: React.CSSProperties = {
  borderRadius: '10px',
  border: '1px solid #334155',
  backgroundColor: '#1e293b',
  color: '#f8fafc',
  fontSize: '12px',
};

/* ════════════════════════════════════════════════════════════════
   HELPER: Stat Card
   ════════════════════════════════════════════════════════════════ */
function StatCard({ icon, iconBg, iconColor, value, label }: {
  icon: string; iconBg: string; iconColor: string; value: number | string; label: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    'arrow-up': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />,
    'arrow-down': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />,
    'equals': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />,
    'chart': <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M3 20.25h18M3.75 3.75v16.5" />,
    'star': <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
    'users': <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />,
  };
  return (
    <div className="bg-[#131b2e] rounded-xl p-4 border border-slate-700/40 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <svg className={`w-4.5 h-4.5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {icons[icon]}
        </svg>
      </div>
      <div>
        <p className="text-xl font-black text-white leading-tight">{value}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SHIFT EXPLORER PANEL (interactive dropdown)
   ════════════════════════════════════════════════════════════════ */
function ShiftExplorerPanel({ globalStats }: { globalStats: GlobalShiftStats[] }) {
  const [selectedKey, setSelectedKey] = useState(
    globalStats.length > 0 ? `${globalStats[0].examDate}|${globalStats[0].shift}` : ''
  );
  const selected = globalStats.find(s => `${s.examDate}|${s.shift}` === selectedKey) || null;

  return (
    <section>
      <h3 className="text-lg font-bold text-white mb-5">Shift Explorer</h3>
      <div className="bg-[#131b2e] rounded-xl p-6 border border-slate-700/40">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Any Shift</p>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className="w-full sm:w-72 py-3 px-4 rounded-lg border border-slate-600 bg-[#0b1120] text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 mb-6"
        >
          {globalStats.map(s => (
            <option key={`${s.examDate}|${s.shift}`} value={`${s.examDate}|${s.shift}`}>
              {s.examDate} - {s.shift === 'Shift 1' ? 'Morning' : 'Evening'}
            </option>
          ))}
        </select>

        {selected && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                { v: selected.totalStudents, l: 'Participants' },
                { v: selected.averageScore, l: 'Average Score' },
                { v: selected.highestScore, l: 'Highest Score' },
                { v: selected.medianScore, l: 'Median Score' },
                { v: selected.lowestScore, l: 'Lowest Score' },
                { v: `${selected.scoreSpread}`, l: 'Score Spread' },
              ].map((c, i) => (
                <div key={i} className="bg-[#0b1120] rounded-lg p-4 border border-slate-700/40">
                  <p className="text-2xl font-black text-white">{c.v}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{c.l}</p>
                </div>
              ))}
            </div>

            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Subject-wise Averages</p>
            <div className="overflow-hidden rounded-lg border border-slate-700/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">Subject</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">Average</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase">Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: 'Physics', a: selected.physicsAvg },
                    { n: 'Chemistry', a: selected.chemistryAvg },
                    { n: 'Mathematics', a: selected.mathsAvg },
                  ].map((s, i) => (
                    <tr key={i} className="border-b border-slate-800/50 last:border-0">
                      <td className="px-4 py-2.5 font-bold text-white">{s.n}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-300">Avg: {s.a}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-slate-500">Total entries: {selected.totalStudents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
