import { supabase } from './db';

export interface QuizQuestion {
  id: string;
  question_id: string;
  exam_date: string;
  shift: string;
  subject: string;
  question_text: string;
  option_1_id: string;
  option_1_text: string;
  option_2_id: string;
  option_2_text: string;
  option_3_id: string;
  option_3_text: string;
  option_4_id: string;
  option_4_text: string;
  correct_option_id: string;
  correct_option_index: number;
  explanation: string;
  question_image_url?: string;
}

export async function getAvailableQuizShifts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('questions')
    .select('exam_date, shift, subject')
    .limit(10000); // We'll group them locally for speed

  if (error || !data) return [];

  const shiftMap = new Map<string, { examDate: string, shift: string, totalCount: number, subjects: Set<string> }>();
  
  for (const row of data) {
    const key = `${row.exam_date} ${row.shift}`;
    if (!shiftMap.has(key)) {
      shiftMap.set(key, { examDate: row.exam_date, shift: row.shift, totalCount: 0, subjects: new Set() });
    }
    const s = shiftMap.get(key)!;
    s.totalCount++;
    s.subjects.add(row.subject);
  }

  return Array.from(shiftMap.values()).map(s => ({
    ...s,
    subjects: Array.from(s.subjects)
  })).sort((a, b) => a.examDate.localeCompare(b.examDate) || a.shift.localeCompare(b.shift));
}

export async function getQuizQuestions(examDate: string, shift: string, subject?: string | null): Promise<QuizQuestion[]> {
  if (!supabase) return [];
  
  let query = supabase
    .from('questions')
    .select('*')
    .eq('exam_date', examDate)
    .eq('shift', shift);
    
  if (subject && subject !== 'All') {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error('Failed to fetch quiz questions:', error);
    return [];
  }
  
  return data as QuizQuestion[];
}

export async function getRandomQuizQuestions(count: number, subject?: string | null): Promise<QuizQuestion[]> {
  if (!supabase) return [];
  
  // Note: PostgreSQL RANDOM() scaling can be slow on huge tables, but fine for ~3000 rows.
  // Supabase RPC for random rows is better, but this works using standard select with limit
  // For truly random across all, we'd use a postgres function. 
  // For now, fetch a chunk and shuffle in JS if needed, or if Supabase supports order by random (not officially in js client).
  
  // Workaround: fetch slightly more, shuffle locally
  let query = supabase
    .from('questions')
    .select('*')
    .limit(count * 3);
    
  if (subject && subject !== 'All') {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  
  // Shuffle array (Fisher-Yates)
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count) as QuizQuestion[];
}
