'use client';

import React, { useState, useMemo } from 'react';
import { CalculationResult, ParseResult } from '@/types';
import { ShiftStats, GlobalShiftStats } from '@/utils/db';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
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

const CARD = "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow";
const LABEL = "text-[10px] font-bold text-gray-400 uppercase tracking-widest";
const tooltipStyle: React.CSSProperties = {
  borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff',
  color: '#1e293b', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
};

export default function DeepAnalysis({
  result, meta, questions, shiftStats, globalStats,
  attempt, examDate, shift, groupType
}: DeepAnalysisProps) {

  const percentile = shiftStats
    ? ((shiftStats.behindCount / Math.max(shiftStats.totalStudents, 1)) * 100).toFixed(1)
    : '0.0';

  const {
    histogramData, crossShiftData, currentGlobal,
    relatedShifts, topperData, subjectShiftData,
    toughestShift, easiestShift, totalGlobalEntries, entriesData
  } = useMemo(() => {
    if (!globalStats) return {
      histogramData: [], crossShiftData: [], currentGlobal: null,
      relatedShifts: [], topperData: [], subjectShiftData: [],
      toughestShift: null, easiestShift: null, totalGlobalEntries: 0, entriesData: []
    };

    const current = globalStats.find(s =>
      s.shift === shift && s.examDate === examDate && s.groupType === groupType && s.attempt === attempt
    );

    // histogram
    const buckets = Array.from({ length: 10 }, (_, i) => ({ label: `${i * 20}-${(i + 1) * 20}`, count: 0 }));
    let userBucket = -1;
    if (current?.scoresList) {
      current.scoresList.forEach(score => { let b = Math.min(Math.floor(score / 20), 9); buckets[b].count++; });
      userBucket = Math.min(Math.floor(result.totalMarks / 20), 9);
    }
    const histData = buckets.map((b, i) => ({ name: b.label, count: b.count, isUser: i === userBucket }));

    const related = globalStats.filter(s => s.groupType === groupType && s.attempt === attempt);
    const fmt = (s: GlobalShiftStats) => `${s.examDate.replace('April ', '').replace('May ', '')} ${s.shift === 'Shift 1' ? 'S1' : 'S2'}`;

    const crossData = related.map(s => ({ name: fmt(s), average: s.averageScore, isCurrent: s.shift === shift && s.examDate === examDate }));
    const tData = related.map(s => ({ name: fmt(s), topper: s.highestScore, isCurrent: s.shift === shift && s.examDate === examDate }));
    const subData = related.map(s => ({ name: fmt(s), physics: s.physicsAvg, chemistry: s.chemistryAvg, maths: s.mathsAvg }));
    const sameDayShifts = related.filter(s => s.examDate === examDate);
    const eData = sameDayShifts.map(s => ({ name: s.shift, value: s.totalStudents }));

    const sorted = [...related].sort((a, b) => a.averageScore - b.averageScore);

    return {
      histogramData: histData, crossShiftData: crossData, currentGlobal: current,
      relatedShifts: related, topperData: tData, subjectShiftData: subData,
      toughestShift: sorted[0] || null, easiestShift: sorted[sorted.length - 1] || null,
      totalGlobalEntries: related.reduce((s, r) => s + r.totalStudents, 0),
      entriesData: eData
    };
  }, [globalStats, shift, examDate, groupType, attempt, result.totalMarks]);

  const radarData = useMemo(() => {
    if (!currentGlobal) return [];
    return [
      { subject: 'Physics', you: result.physics.marks, avg: currentGlobal.physicsAvg },
      { subject: 'Chemistry', you: result.chemistry.marks, avg: currentGlobal.chemistryAvg },
      { subject: 'Maths', you: result.maths.marks, avg: currentGlobal.mathsAvg },
    ];
  }, [result, currentGlobal]);

  const [shiftCompTab, setShiftCompTab] = useState<'topper' | 'average'>('topper');
  const PIE_COLORS = ['#4338ca', '#10b981'];

  return (
    <div className="w-full space-y-8">

      {/* ═══ HERO BANNER ═══ */}
      <div className={`${CARD} p-6 sm:p-8 bg-gradient-to-br from-[#4338ca] to-[#6366f1] text-white border-0`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold">Detailed Performance Report</h2>
            <p className="text-indigo-200 text-sm mt-1">{examDate} · {shift} · {attempt}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />Live
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold backdrop-blur-sm">
              {totalGlobalEntries} total entries
            </span>
          </div>
        </div>
      </div>

      {/* ═══ YOUR POSITION ═══ */}
      {shiftStats && (
        <section>
          <SectionHeader label="01" title="Your Position in This Shift" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Rank — spans 2 cols on mobile, 1 col on desktop */}
            <div className={`${CARD} p-6 col-span-2 sm:col-span-1 sm:row-span-2 flex flex-col items-center justify-center`}>
              <p className={LABEL}>Shift Rank</p>
              <p className="text-5xl sm:text-6xl font-black text-[#4338ca] leading-none mt-2">
                #{shiftStats.aheadCount + 1}
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-2">of {shiftStats.totalStudents} students</p>
              <p className="text-xs text-gray-400 mt-3 text-center">Top {percentile}%</p>
            </div>

            <MiniStat label="Ahead of you" value={shiftStats.aheadCount} color="text-rose-500" />
            <MiniStat label="Shift Average" value={shiftStats.averageScore} color="text-amber-500" />
            <MiniStat label="Same Score" value={Math.max(0, shiftStats.totalStudents - shiftStats.aheadCount - shiftStats.behindCount - 1)} color="text-blue-500" />
            <MiniStat label="Shift Topper" value={shiftStats.highestScore} color="text-[#4338ca]" />
            <MiniStat label="Below You" value={shiftStats.behindCount} color="text-emerald-500" />
            <MiniStat label="Participants" value={shiftStats.totalStudents} color="text-gray-700" />
          </div>

          {/* You vs Shift chart */}
          <div className={`${CARD} p-6 mt-4`}>
            <h4 className="text-sm font-bold text-gray-800 mb-5">Your Score vs Shift</h4>
            <div className="h-56 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'You', value: result.totalMarks },
                  { name: 'Average', value: shiftStats.averageScore },
                  { name: 'Topper', value: shiftStats.highestScore },
                ]} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 200]} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                    <Cell fill="#4338ca" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* ═══ SUBJECT-WISE PERFORMANCE ═══ */}
      {currentGlobal && (
        <section>
          <SectionHeader label="02" title="Subject-wise Breakdown" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Radar */}
            <div className={`${CARD} p-5 lg:col-span-2`}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">You vs Shift Avg</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <Radar name="You" dataKey="you" stroke="#4338ca" fill="#4338ca" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Shift Avg" dataKey="avg" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Subject cards */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { sub: result.physics, avg: currentGlobal.physicsAvg, color: '#4338ca', bg: 'bg-indigo-50', border: 'border-l-indigo-500' },
                { sub: result.chemistry, avg: currentGlobal.chemistryAvg, color: '#10b981', bg: 'bg-emerald-50', border: 'border-l-emerald-500' },
                { sub: result.maths, avg: currentGlobal.mathsAvg, color: '#f59e0b', bg: 'bg-amber-50', border: 'border-l-amber-500' },
              ].map(({ sub, avg, color, bg, border }) => {
                const pct = sub.maxMarks > 0 ? (sub.marks / sub.maxMarks) * 100 : 0;
                return (
                  <div key={sub.subject} className={`${CARD} p-5 border-l-4 ${border}`}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{sub.subject}</p>
                    <p className="text-3xl font-black text-gray-800 mt-2">{sub.marks}<span className="text-sm font-semibold text-gray-400">/{sub.maxMarks}</span></p>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-400 uppercase">
                      <span>Accuracy: {Math.round(sub.accuracy)}%</span>
                      <span>Avg: {avg}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs font-semibold text-gray-500">
                      <span className="text-emerald-500">✓ {sub.correct}</span>
                      <span className="text-rose-500">✗ {sub.incorrect}</span>
                      <span className="text-gray-400">— {sub.unattempted}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ QUESTION-WISE TABLE ═══ */}
      <section>
        <SectionHeader label="03" title="Question-wise Breakdown" />
        <div className={`${CARD} overflow-hidden`}>
          <div className="overflow-x-auto max-h-[420px]">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-100">Q.No</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-100">Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-100">Your Ans</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-100">Correct</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase border-b border-gray-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => {
                  const correct = q.candidateResponse === q.correctOption;
                  const skip = !q.candidateResponse;
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-2.5 font-mono text-xs text-gray-400">{q.questionId}</td>
                      <td className="px-5 py-2.5 text-gray-600 font-medium">{q.subject}</td>
                      <td className="px-5 py-2.5 font-bold text-gray-800">{q.candidateResponse || '—'}</td>
                      <td className="px-5 py-2.5 font-bold text-[#4338ca]">{q.correctOption}</td>
                      <td className="px-5 py-2.5">
                        {correct ? <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold">✓</span>
                          : skip ? <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-xs font-bold">—</span>
                          : <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-500 text-xs font-bold">✗</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ SCORE DISTRIBUTION ═══ */}
      <section>
        <SectionHeader label="04" title="Score Distribution" />
        <div className={`${CARD} p-6`}>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {histogramData.map((e, i) => <Cell key={i} fill={e.isUser ? '#4338ca' : '#e2e8f0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">Your range highlighted in indigo</p>
        </div>
      </section>

      {/* ═══ CROSS-SHIFT + TOPPER CHARTS ═══ */}
      <section>
        <SectionHeader label="05" title="Cross-Shift Comparison" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Average Comparison */}
          <div className={`${CARD} p-6`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Shift Averages</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crossShiftData} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} width={40} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="average" radius={[0, 6, 6, 0]} maxBarSize={16}>
                    {crossShiftData.map((e, i) => <Cell key={i} fill={e.isCurrent ? '#4338ca' : '#c7d2fe'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Topper Comparison */}
          <div className={`${CARD} p-6`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Shift Toppers</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topperData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="topper" radius={[6, 6, 0, 0]} maxBarSize={30}>
                    {topperData.map((e, i) => <Cell key={i} fill={(e as any).isCurrent ? '#f59e0b' : '#fde68a'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SUBJECT-WISE PER SHIFT ═══ */}
      <section>
        <SectionHeader label="06" title="Subject Averages Across Shifts" />
        <div className={`${CARD} p-6`}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectShiftData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                <Bar dataKey="physics" name="Physics" fill="#4338ca" radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="chemistry" name="Chemistry" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={16} />
                <Bar dataKey="maths" name="Maths" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ═══ SHIFT DIFFICULTY ═══ */}
      {toughestShift && easiestShift && (
        <section>
          <SectionHeader label="07" title="Shift Difficulty Ranking" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className={`${CARD} p-5 border-l-4 border-l-rose-500`}>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Toughest Shift</p>
              <p className="text-lg font-bold text-gray-800">{toughestShift.examDate} · {toughestShift.shift}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: <strong className="text-gray-800">{toughestShift.averageScore}</strong></p>
            </div>
            <div className={`${CARD} p-5 border-l-4 border-l-emerald-500`}>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Easiest Shift</p>
              <p className="text-lg font-bold text-gray-800">{easiestShift.examDate} · {easiestShift.shift}</p>
              <p className="text-sm text-gray-500 mt-1">Avg: <strong className="text-gray-800">{easiestShift.averageScore}</strong></p>
            </div>
          </div>
        </section>
      )}

      {/* ═══ ENTRIES OVERVIEW ═══ */}
      <section>
        <SectionHeader label="08" title="Entries Overview" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${CARD} p-6 flex items-center justify-center`}>
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={entriesData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {entriesData.map((_, i) => <PieCell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={`${CARD} p-6 sm:col-span-2 flex flex-col justify-center`}>
            <p className="text-4xl font-black text-[#4338ca]">{totalGlobalEntries}</p>
            <p className={`${LABEL} mt-1`}>Total Entries</p>
            <div className="mt-4 space-y-2">
              {entriesData.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm text-gray-600 font-semibold">{e.name}: <strong className="text-gray-800">{e.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHIFT EXPLORER ═══ */}
      {relatedShifts.length > 0 && (
        <section>
          <SectionHeader label="09" title="Shift Explorer" />
          <ShiftExplorerPanel globalStats={relatedShifts} />
        </section>
      )}

    </div>
  );
}

/* ──── Section Header ──── */
function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold text-[#4338ca] uppercase tracking-widest mb-0.5">Section {label}</p>
      <h3 className="text-lg font-bold text-[#0f172a]">{title}</h3>
    </div>
  );
}

/* ──── Mini Stat Card ──── */
function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <p className="text-2xl font-black leading-tight"><span className={color}>{value}</span></p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

/* ──── Shift Explorer Panel ──── */
export function ShiftExplorerPanel({ globalStats }: { globalStats: GlobalShiftStats[] }) {
  const [selectedKey, setSelectedKey] = useState(() => {
    if (globalStats.length === 0) return '';
    const attempt2 = globalStats.find(s => s.attempt === 'Attempt 2');
    if (attempt2) return `${attempt2.attempt}|${attempt2.examDate}|${attempt2.shift}`;
    return `${globalStats[0].attempt}|${globalStats[0].examDate}|${globalStats[0].shift}`;
  });
  const selected = globalStats.find(s => `${s.attempt}|${s.examDate}|${s.shift}` === selectedKey) || null;

  // Group stats by attempt for optgroup rendering
  const attempt1Shifts = globalStats.filter(s => s.attempt === 'Attempt 1');
  const attempt2Shifts = globalStats.filter(s => s.attempt === 'Attempt 2');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <select
        value={selectedKey}
        onChange={(e) => setSelectedKey(e.target.value)}
        className="w-full sm:w-80 py-3 px-4 rounded-xl border border-gray-200 text-[#0f172a] bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] mb-5"
      >
        {attempt1Shifts.length > 0 && (
          <optgroup label="📋 Attempt 1 — April Session">
            {attempt1Shifts.map(s => (
              <option key={`${s.attempt}|${s.examDate}|${s.shift}`} value={`${s.attempt}|${s.examDate}|${s.shift}`}>
                {s.examDate} - {s.shift === 'Shift 1' ? 'Morning' : 'Evening'}
              </option>
            ))}
          </optgroup>
        )}
        {attempt2Shifts.length > 0 && (
          <optgroup label="🔥 Attempt 2 — May Session">
            {attempt2Shifts.map(s => (
              <option key={`${s.attempt}|${s.examDate}|${s.shift}`} value={`${s.attempt}|${s.examDate}|${s.shift}`}>
                {s.examDate} - {s.shift === 'Shift 1' ? 'Morning' : 'Evening'}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {selected && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {[
              { v: selected.totalStudents, l: 'Participants' },
              { v: selected.averageScore, l: 'Average Score' },
              { v: selected.highestScore, l: 'Highest Score' },
              { v: selected.medianScore, l: 'Median Score' },
              { v: selected.lowestScore, l: 'Lowest Score' },
              { v: selected.scoreSpread, l: 'Score Spread' },
            ].map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-2xl font-black text-[#0f172a]">{c.v}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{c.l}</p>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Subject-wise Averages</p>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase">Subject</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase">Average</th>
                  <th className="text-right px-4 py-2.5 text-xs font-bold text-gray-400 uppercase">Entries</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 'Physics', a: selected.physicsAvg },
                  { n: 'Chemistry', a: selected.chemistryAvg },
                  { n: 'Mathematics', a: selected.mathsAvg },
                ].map((s, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-4 py-2.5 font-bold text-gray-800">{s.n}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-600">Avg: {s.a}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-400">{selected.totalStudents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
