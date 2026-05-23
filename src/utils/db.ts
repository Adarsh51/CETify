import { createClient } from '@supabase/supabase-js';

export interface CandidateScoreRecord {
  id?: string;
  candidateName: string;
  applicationNumber: string;
  totalMarks: number;
  physicsMarks: number;
  chemistryMarks: number;
  mathsMarks: number;
  groupType: 'PCM' | 'PCB';
  attempt: 'Attempt 1' | 'Attempt 2';
  examDate: string; // e.g. "April 11"
  shift: 'Shift 1' | 'Shift 2';
  createdAt?: string;
  rawHtml?: string; // Storing the full raw HTML sheet
  examCode?: string; // Storing the exam code to assist in crowdsourcing
}

export interface ShiftStats {
  totalStudents: number;
  aheadCount: number;
  behindCount: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
}

export interface GlobalShiftStats {
  groupType: 'PCM' | 'PCB';
  attempt: 'Attempt 1' | 'Attempt 2';
  examDate: string;
  shift: 'Shift 1' | 'Shift 2';
  totalStudents: number;
  highestScore: number;
  lowestScore: number;
  averageScore: number;
  medianScore: number;
  scoreSpread: number;
  physicsAvg: number;
  chemistryAvg: number;
  mathsAvg: number;
  scoresList: number[];
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase Client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = 'cetify_local_scores';

// Clear all records from LocalStorage
export function clearAllLocalRecords(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear localStorage records:', e);
    return false;
  }
}

// Retrieve all records from LocalStorage
function getLocalRecords(): CandidateScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse localStorage records:', e);
    return [];
  }
}

// Save a single record to LocalStorage
function saveLocalRecord(record: CandidateScoreRecord) {
  if (typeof window === 'undefined') return;
  try {
    const records = getLocalRecords();
    
    // Avoid double entry of same application number in same shift
    const filtered = records.filter(
      r => !(r.applicationNumber === record.applicationNumber && r.examDate === record.examDate && r.shift === record.shift)
    );
    
    // Keep local records lightweight (don't store rawHtml in localStorage to avoid quota limits!)
    const { rawHtml, ...restRecord } = record;
    
    filtered.push({
      ...restRecord,
      id: record.id || Math.random().toString(36).substring(2, 9),
      createdAt: record.createdAt || new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

/**
 * Saves a student's calculated score record.
 * Tries Supabase first, falls back to localStorage on any failure.
 */
export async function saveScore(record: CandidateScoreRecord): Promise<boolean> {
  // Always log locally first to ensure fallback safety
  saveLocalRecord(record);

  if (!supabase) {
    console.log('Supabase not configured. Saved to local storage.');
    return false;
  }

  try {
    const { error } = await supabase
      .from('scores')
      .upsert({
        candidate_name: record.candidateName,
        application_number: record.applicationNumber,
        total_marks: record.totalMarks,
        physics_marks: record.physicsMarks,
        chemistry_marks: record.chemistryMarks,
        maths_marks: record.mathsMarks,
        group_type: record.groupType,
        attempt: record.attempt,
        exam_date: record.examDate,
        shift: record.shift,
        raw_html: record.rawHtml, // Saves raw HTML response sheet anonymously
      }, {
        onConflict: 'application_number,exam_date,shift,attempt'
      });

    if (error) {
      console.warn('Supabase save error, falling back to local storage:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Network error saving to Supabase. Fallback active.');
    return false;
  }
}

/**
 * Validates and autocorrects the shift based on crowdsourced data and application lock-in.
 * Returns the corrected shift if a mismatch is found, or null if everything is correct.
 */
export async function validateAndCorrectShift(
  applicationNumber: string,
  examCode: string,
  selectedExamDate: string,
  selectedShift: 'Shift 1' | 'Shift 2'
): Promise<{ examDate: string; shift: 'Shift 1' | 'Shift 2'; reason: 'lock-in' | 'autocorrect' } | null> {
  // 1. Check Application Number Lock-in (Local Storage)
  const local = getLocalRecords();
  const localMatch = local.find(r => r.applicationNumber === applicationNumber);
  if (localMatch) {
    if (localMatch.examDate !== selectedExamDate || localMatch.shift !== selectedShift) {
      return { examDate: localMatch.examDate, shift: localMatch.shift, reason: 'lock-in' };
    }
    return null; // Already validated locally
  }

  // 2. Check Application Number Lock-in (Supabase)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('exam_date, shift')
        .eq('application_number', applicationNumber)
        .limit(1);
        
      if (!error && data && data.length > 0) {
        const dbMatch = data[0];
        if (dbMatch.exam_date !== selectedExamDate || dbMatch.shift !== selectedShift) {
          return { examDate: dbMatch.exam_date, shift: dbMatch.shift as 'Shift 1' | 'Shift 2', reason: 'lock-in' };
        }
        return null; // Already validated via DB
      }
    } catch (e) {
      console.warn('Network error checking shift lock-in:', e);
    }
  }

  // 3. Crowdsourced Autocorrect based on Exam Code (Supabase)
  if (supabase && examCode && examCode.trim() !== '') {
    try {
      // Find what shift the majority of students with this same examCode selected
      const { data, error } = await supabase
        .from('scores')
        .select('exam_date, shift')
        .ilike('raw_html', `%${examCode}%`)
        .limit(15);

      if (!error && data && data.length > 0) {
        const counts: Record<string, number> = {};
        let maxCount = 0;
        let mostFrequent = data[0];

        for (const row of data) {
          const key = `${row.exam_date}|${row.shift}`;
          counts[key] = (counts[key] || 0) + 1;
          if (counts[key] > maxCount) {
            maxCount = counts[key];
            mostFrequent = row;
          }
        }

        // If the crowd consensus disagrees with the user's manual selection, autocorrect it
        if (mostFrequent.exam_date !== selectedExamDate || mostFrequent.shift !== selectedShift) {
          return { 
            examDate: mostFrequent.exam_date, 
            shift: mostFrequent.shift as 'Shift 1' | 'Shift 2',
            reason: 'autocorrect'
          };
        }
      }
    } catch (e) {
      console.warn('Network error during crowdsourced autocorrect:', e);
    }
  }

  return null; // No correction needed
}

/**
 * Computes comparative statistics for a candidate's shift.
 */
export async function getShiftStats(
  record: CandidateScoreRecord
): Promise<ShiftStats> {
  const currentScore = record.totalMarks;
  
  let matchingRecords: CandidateScoreRecord[] = [];
  let isFromSupabase = false;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('group_type', record.groupType)
        .eq('attempt', record.attempt)
        .eq('exam_date', record.examDate)
        .eq('shift', record.shift);

      if (!error && data) {
        matchingRecords = data.map(d => ({
          candidateName: d.candidate_name,
          applicationNumber: d.application_number,
          totalMarks: d.total_marks,
          physicsMarks: d.physics_marks,
          chemistryMarks: d.chemistry_marks,
          mathsMarks: d.maths_marks,
          groupType: d.group_type,
          attempt: d.attempt,
          examDate: d.exam_date,
          shift: d.shift,
        }));
        isFromSupabase = true;
      }
    } catch (e) {
      console.warn('Failed to query Supabase stats. Querying local storage.');
    }
  }

  // Fallback to localStorage if Supabase failed or isn't set
  if (!isFromSupabase) {
    const local = getLocalRecords();
    matchingRecords = local.filter(
      r => r.groupType === record.groupType &&
           r.attempt === record.attempt &&
           r.examDate === record.examDate &&
           r.shift === record.shift
    );
  }

  // Add the current candidate to the dataset if they aren't already included
  const exists = matchingRecords.some(r => r.applicationNumber === record.applicationNumber);
  if (!exists) {
    matchingRecords.push(record);
  }

  const totalStudents = matchingRecords.length;

  // Calculate scores metrics
  let aheadCount = 0;
  let behindCount = 0;
  let highestScore = -Infinity;
  let lowestScore = Infinity;
  let totalScoreSum = 0;

  for (const r of matchingRecords) {
    if (r.totalMarks > currentScore) {
      aheadCount++;
    } else if (r.totalMarks < currentScore) {
      behindCount++;
    }
    
    if (r.totalMarks > highestScore) {
      highestScore = r.totalMarks;
    }
    if (r.totalMarks < lowestScore) {
      lowestScore = r.totalMarks;
    }
    totalScoreSum += r.totalMarks;
  }

  const averageScore = Math.round((totalScoreSum / totalStudents) * 10) / 10;

  return {
    totalStudents,
    aheadCount,
    behindCount,
    highestScore,
    lowestScore: lowestScore === Infinity ? 0 : lowestScore,
    averageScore,
  };
}

/**
 * Fetch and aggregate global shift statistics across all shifts.
 * Securely queries ONLY necessary stats (marks/slot) without downloading names or HTML.
 */
export async function getAllShiftsStats(): Promise<GlobalShiftStats[]> {
  let records: Array<{
    total_marks: number;
    physics_marks: number;
    chemistry_marks: number;
    maths_marks: number;
    group_type: 'PCM' | 'PCB';
    attempt: 'Attempt 1' | 'Attempt 2';
    exam_date: string;
    shift: 'Shift 1' | 'Shift 2';
  }> = [];

  let isFromSupabase = false;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('total_marks, physics_marks, chemistry_marks, maths_marks, group_type, attempt, exam_date, shift');

      if (!error && data) {
        records = data.map(d => ({
          total_marks: d.total_marks,
          physics_marks: d.physics_marks || 0,
          chemistry_marks: d.chemistry_marks || 0,
          maths_marks: d.maths_marks || 0,
          group_type: d.group_type as 'PCM' | 'PCB',
          attempt: d.attempt as 'Attempt 1' | 'Attempt 2',
          exam_date: d.exam_date,
          shift: d.shift as 'Shift 1' | 'Shift 2',
        }));
        isFromSupabase = true;
      } else if (error) {
        console.warn('Supabase fetch global stats error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase fetch global stats error:', e);
    }
  }

  // Fallback to LocalStorage records if Supabase failed or isn't set
  if (!isFromSupabase) {
    const local = getLocalRecords();
    records = local.map(r => ({
      total_marks: r.totalMarks,
      physics_marks: r.physicsMarks || 0,
      chemistry_marks: r.chemistryMarks || 0,
      maths_marks: r.mathsMarks || 0,
      group_type: r.groupType,
      attempt: r.attempt,
      exam_date: r.examDate,
      shift: r.shift,
    }));
  }

  return aggregateAllShifts(records);
}

// Internal helper to group and aggregate shift records
function aggregateAllShifts(
  records: Array<{
    total_marks: number;
    physics_marks: number;
    chemistry_marks: number;
    maths_marks: number;
    group_type: 'PCM' | 'PCB';
    attempt: 'Attempt 1' | 'Attempt 2';
    exam_date: string;
    shift: 'Shift 1' | 'Shift 2';
  }>
): GlobalShiftStats[] {
  const groups: Record<string, {
    scores: number[];
    physicsScores: number[];
    chemistryScores: number[];
    mathsScores: number[];
    groupType: 'PCM' | 'PCB';
    attempt: 'Attempt 1' | 'Attempt 2';
    examDate: string;
    shift: 'Shift 1' | 'Shift 2';
  }> = {};

  for (const r of records) {
    const key = `${r.attempt}-${r.group_type}-${r.exam_date}-${r.shift}`;
    if (!groups[key]) {
      groups[key] = {
        scores: [],
        physicsScores: [],
        chemistryScores: [],
        mathsScores: [],
        groupType: r.group_type,
        attempt: r.attempt,
        examDate: r.exam_date,
        shift: r.shift,
      };
    }
    groups[key].scores.push(r.total_marks);
    groups[key].physicsScores.push(r.physics_marks);
    groups[key].chemistryScores.push(r.chemistry_marks);
    groups[key].mathsScores.push(r.maths_marks);
  }

  const result = Object.values(groups).map(g => {
    const totalStudents = g.scores.length;
    const sortedScores = [...g.scores].sort((a, b) => a - b);
    const highestScore = sortedScores[totalStudents - 1] || 0;
    const lowestScore = sortedScores[0] || 0;
    const sum = sortedScores.reduce((sum, score) => sum + score, 0);
    const averageScore = Math.round((sum / totalStudents) * 10) / 10;
    
    let medianScore = 0;
    if (totalStudents > 0) {
      const mid = Math.floor(totalStudents / 2);
      medianScore = totalStudents % 2 !== 0 ? sortedScores[mid] : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
    }
    const scoreSpread = highestScore - lowestScore;
    
    const physicsSum = g.physicsScores.reduce((s, m) => s + m, 0);
    const chemistrySum = g.chemistryScores.reduce((s, m) => s + m, 0);
    const mathsSum = g.mathsScores.reduce((s, m) => s + m, 0);

    return {
      groupType: g.groupType,
      attempt: g.attempt,
      examDate: g.examDate,
      shift: g.shift,
      totalStudents,
      highestScore,
      lowestScore,
      averageScore,
      medianScore: Math.round(medianScore * 10) / 10,
      scoreSpread,
      physicsAvg: Math.round((physicsSum / totalStudents) * 10) / 10,
      chemistryAvg: Math.round((chemistrySum / totalStudents) * 10) / 10,
      mathsAvg: Math.round((mathsSum / totalStudents) * 10) / 10,
      scoresList: sortedScores,
    };
  });

  // Sort by Attempt, Group, Date (custom day parsing), and Shift
  return result.sort((a, b) => {
    if (a.attempt !== b.attempt) return a.attempt.localeCompare(b.attempt);
    if (a.groupType !== b.groupType) return a.groupType.localeCompare(b.groupType);
    
    // Simple date extraction and comparison (e.g. "April 11" vs "April 13")
    const getDay = (dateStr: string) => {
      const parts = dateStr.trim().split(/\s+/);
      const dayStr = parts[1] || parts[0];
      return parseInt(dayStr, 10) || 0;
    };
    const dayA = getDay(a.examDate);
    const dayB = getDay(b.examDate);
    if (dayA !== dayB) return dayA - dayB;
    
    return a.shift.localeCompare(b.shift);
  });
}
