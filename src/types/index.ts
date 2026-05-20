export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';

export interface ParsedQuestion {
  questionId: string;
  subject: Subject;
  correctOption: string;
  candidateResponse: string | null; // null = unanswered
}

export interface SubjectResult {
  subject: Subject;
  correct: number;
  incorrect: number;
  unattempted: number;
  marks: number;
  totalQuestions: number;
  maxMarks: number;
  accuracy: number; // percentage
}

export interface CalculationResult {
  physics: SubjectResult;
  chemistry: SubjectResult;
  maths: SubjectResult;
  totalMarks: number;
  maxMarks: number; // 200
  percentage: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnattempted: number;
  totalQuestions: number;
}

export interface ExamMeta {
  candidateName: string;
  applicationNumber: string;
  examCode: string;
  totalQuestions: number;
}

export interface ParseResult {
  questions: ParsedQuestion[];
  meta: ExamMeta;
}

export type AppState = 'idle' | 'parsing' | 'results' | 'error';

export interface ExamSlotDetails {
  groupType: 'PCM' | 'PCB';
  attempt: 'Attempt 1' | 'Attempt 2';
  examDate: string;
  shift: 'Shift 1' | 'Shift 2';
}
