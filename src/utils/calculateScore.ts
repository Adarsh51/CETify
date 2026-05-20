import { ParsedQuestion, CalculationResult, SubjectResult, Subject } from '@/types';

// Scoring rules:
// Physics: +1 per correct answer (50 questions, max 50)
// Chemistry: +1 per correct answer (50 questions, max 50)
// Mathematics: +2 per correct answer (50 questions, max 100)
// No negative marking
// Total max: 200

const MARKS_PER_SUBJECT: Record<Subject, number> = {
  'Physics': 1,
  'Chemistry': 1,
  'Mathematics': 2,
};

const MAX_QUESTIONS_PER_SUBJECT = 50;

function calculateSubjectResult(questions: ParsedQuestion[], subject: Subject): SubjectResult {
  const subjectQuestions = questions.filter(q => q.subject === subject);
  const marksPerCorrect = MARKS_PER_SUBJECT[subject];

  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;

  for (const q of subjectQuestions) {
    if (!q.candidateResponse) {
      unattempted++;
    } else if (q.candidateResponse === q.correctOption) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const marks = correct * marksPerCorrect;
  const maxMarks = MAX_QUESTIONS_PER_SUBJECT * marksPerCorrect;
  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

  return {
    subject,
    correct,
    incorrect,
    unattempted,
    marks,
    totalQuestions: subjectQuestions.length,
    maxMarks,
    accuracy: Math.round(accuracy * 10) / 10,
  };
}

export function calculateScore(questions: ParsedQuestion[]): CalculationResult {
  const physics = calculateSubjectResult(questions, 'Physics');
  const chemistry = calculateSubjectResult(questions, 'Chemistry');
  const maths = calculateSubjectResult(questions, 'Mathematics');

  const totalMarks = physics.marks + chemistry.marks + maths.marks;
  const maxMarks = physics.maxMarks + chemistry.maxMarks + maths.maxMarks;

  return {
    physics,
    chemistry,
    maths,
    totalMarks,
    maxMarks,
    percentage: Math.round((totalMarks / maxMarks) * 1000) / 10,
    totalCorrect: physics.correct + chemistry.correct + maths.correct,
    totalIncorrect: physics.incorrect + chemistry.incorrect + maths.incorrect,
    totalUnattempted: physics.unattempted + chemistry.unattempted + maths.unattempted,
    totalQuestions: physics.totalQuestions + chemistry.totalQuestions + maths.totalQuestions,
  };
}
