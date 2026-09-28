import type { Dictionary } from '@/locales/types';
import { getTranslation } from '../../quizScoring.shared';
import type { QuizAnswer, QuizAnswerState } from '../../types/quiz.types';

export type QuizLabels = Dictionary['academyQuiz'];

export interface MatchingSelection {
  questionId: number | null;
  leftAnswerId: number | null;
}

/** Answer-state + handlers every question renderer receives from QuizRunner. */
export interface QuestionInteraction {
  answers: Record<number, QuizAnswerState>;
  langId: number;
  labels: QuizLabels;
  shuffledRights: Record<number, QuizAnswer[]>;
  matchingSelection: MatchingSelection;
  onSingle: (questionId: number, answerId: number) => void;
  onToggle: (questionId: number, answerId: number) => void;
  onMatchingClick: (
    questionId: number,
    answerId: number,
    side: 'left' | 'right'
  ) => void;
  onRemoveMatch: (questionId: number, leftId: number) => void;
}

export function answerLabel(
  answer: QuizAnswer,
  langId: number,
  labels: QuizLabels
): string {
  const text =
    getTranslation(answer.translations, langId)?.text ?? `${answer.order}`;
  const normalized = text.trim().toLowerCase();
  if (normalized === 'true') return labels.trueLabel;
  if (normalized === 'false') return labels.falseLabel;
  return text;
}

/** `m:ss` for the countdown. */
export function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
}

/** DOM id of a question's visible text, used to label its option group. */
export function questionTitleId(questionId: number): string {
  return `quiz-question-${questionId}-title`;
}
