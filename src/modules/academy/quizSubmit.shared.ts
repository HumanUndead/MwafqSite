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
 * Build the multipart payload for `UserQuizAttempt/Create`.
 *
 * Each selected answer becomes an `Answers[i]` triple of
 * `questionId`, `answerId`, `matchedWithAnswerId` (0 unless matching).
 */
export function buildAttemptFormData({
  userId,
  quizId,
  userCourseId,
  startTime,
  endTime,
  answers,
}: BuildAttemptParams): FormData {
  const formData = new FormData();
  formData.append('Id', '0');
  formData.append('UserId', userId);
  formData.append('QuizId', String(quizId));
  formData.append('StartTime', startTime);
  formData.append('EndTime', endTime);
  formData.append('UserCourseId', String(userCourseId));

  let index = 0;
  const appendAnswer = (
    questionId: number,
    answerId: number,
    matchedWithAnswerId: number
  ) => {
    formData.append(`Answers[${index}].questionId`, String(questionId));
    formData.append(`Answers[${index}].answerId`, String(answerId));
    formData.append(
      `Answers[${index}].matchedWithAnswerId`,
      String(matchedWithAnswerId)
    );
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
    formData.append('Answers', '[]');
  }

  return formData;
}
