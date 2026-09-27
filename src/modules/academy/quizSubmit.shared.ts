import type { QuizAnswerState } from './types/quiz.types';

interface BuildAttemptParams {
  userId: string;
  quizId: number;
  userCourseId: number;
  startTime: string;
  endTime: string;
  answers: QuizAnswerState[];
}

/**
 * Flatten an attempt into `UserQuizAttempt/Create` field/value pairs.
 *
 * Each selected answer becomes an `Answers[i]` triple of
 * `questionId`, `answerId`, `matchedWithAnswerId` (0 unless matching).
 */
function buildAttemptEntries({
  userId,
  quizId,
  userCourseId,
  startTime,
  endTime,
  answers,
}: BuildAttemptParams): Array<[string, string]> {
  const entries: Array<[string, string]> = [
    ['Id', '0'],
    ['UserId', userId],
    ['QuizId', String(quizId)],
    ['StartTime', startTime],
    ['EndTime', endTime],
    ['UserCourseId', String(userCourseId)],
  ];

  let index = 0;
  const appendAnswer = (
    questionId: number,
    answerId: number,
    matchedWithAnswerId: number
  ) => {
    entries.push([`Answers[${index}].questionId`, String(questionId)]);
    entries.push([`Answers[${index}].answerId`, String(answerId)]);
    entries.push([
      `Answers[${index}].matchedWithAnswerId`,
      String(matchedWithAnswerId),
    ]);
    index += 1;
  };

  answers.forEach((answer) => {
    const matchedEntries = Object.entries(answer.matchedAnswers);
    if (matchedEntries.length > 0) {
      matchedEntries.forEach(([left, right]) => {
        appendAnswer(answer.questionId, Number(left), Number(right));
      });
    } else if (answer.selectedAnswerIds.length > 0) {
      answer.selectedAnswerIds.forEach((answerId) => {
        appendAnswer(answer.questionId, answerId, 0);
      });
    } else if (answer.selectedAnswerId !== null) {
      appendAnswer(answer.questionId, answer.selectedAnswerId, 0);
    }
  });

  if (index === 0) {
    entries.push(['Answers', '[]']);
  }

  return entries;
}

/** Multipart payload for the normal submit. */
export function buildAttemptFormData(params: BuildAttemptParams): FormData {
  const formData = new FormData();
  buildAttemptEntries(params).forEach(([key, value]) =>
    formData.append(key, value)
  );
  return formData;
}
