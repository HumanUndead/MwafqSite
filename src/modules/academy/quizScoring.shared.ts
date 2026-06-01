import { QuestionType } from './types/quiz.types';
import type { AttemptResult, QuizData } from './types/quiz.types';

export function getScorePercentage(
  score: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((score / totalQuestions) * 100);
}

export function getScoreBadgeColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100 text-green-700';
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = Math.max(0, end - start);
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function formatQuizDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Pick the translation for a langId, falling back to the first. */
export function getTranslation<T extends { langId: number }>(
  translations: T[],
  langId: number
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  return translations.find((t) => t.langId === langId) || translations[0];
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Count correct answers across all supported question types. */
export function calculateCorrectScore(
  quiz: QuizData | null,
  results: AttemptResult | null
): number {
  if (!quiz || !results) return 0;

  let correct = 0;

  quiz.questions.forEach((question) => {
    if (question.type === QuestionType.Video) {
      const subQuestions = question.relatedQuizQuestions ?? [];
      if (subQuestions.length === 0) return;

      const allCorrect = subQuestions.every((sub) => {
        const userAnswers = results.answers.filter(
          (a) => a.questionId === sub.id
        );
        if (userAnswers.length === 0) return false;

        if (
          sub.type === QuestionType.SingleChoice ||
          sub.type === QuestionType.TrueOrFalse ||
          sub.type === QuestionType.Matching
        ) {
          return userAnswers.every((a) => a.isCorrect);
        }
        if (sub.type === QuestionType.MultipleChoice) {
          const correctIds = sub.quizQuestionAnswers
            .filter((a) => a.isCorrect)
            .map((a) => a.id);
          const selectedIds = userAnswers.map((a) => a.answerId);
          return (
            selectedIds.length === correctIds.length &&
            selectedIds.every((id) => correctIds.includes(id))
          );
        }
        return false;
      });

      if (allCorrect) correct += 1;
      return;
    }

    const userAnswers = results.answers.filter(
      (a) => a.questionId === question.id
    );
    if (userAnswers.length === 0) return;

    if (
      question.type === QuestionType.SingleChoice ||
      question.type === QuestionType.TrueOrFalse
    ) {
      if (userAnswers[0]?.isCorrect) correct += 1;
    } else if (question.type === QuestionType.MultipleChoice) {
      const correctIds = question.quizQuestionAnswers
        .filter((a) => a.isCorrect)
        .map((a) => a.id);
      const selectedIds = userAnswers.map((a) => a.answerId);
      if (
        selectedIds.length === correctIds.length &&
        selectedIds.every((id) => correctIds.includes(id))
      ) {
        correct += 1;
      }
    } else if (question.type === QuestionType.Matching) {
      if (userAnswers.every((a) => a.isCorrect)) correct += 1;
    }
  });

  return correct;
}
