import { ListChecks, Target } from 'lucide-react';
import { getTranslation } from '../../quizScoring.shared';
import { QuestionType } from '../../types/quiz.types';
import type { QuizQuestion } from '../../types/quiz.types';
import { getVimeoEmbedUrl } from '../../vimeo.shared';
import { CourseProgressBar } from '../CourseProgressBar';
import { GlassPanel } from '../ui/AcademyGlass';
import { MatchingQuestion } from './MatchingQuestion';
import { OptionTile } from './OptionTile';
import {
  answerLabel,
  questionTitleId,
  type QuestionInteraction,
} from './quizUi';

/** The focused glass card: progress, question text and its answers. */
export function QuestionCard({
  question,
  index,
  progress,
  ...interaction
}: {
  question: QuizQuestion;
  index: number;
  /** 0–100, position in the quiz. */
  progress: number;
} & QuestionInteraction) {
  const { labels, langId } = interaction;
  const translation = getTranslation(question.translations, langId);

  return (
    <GlassPanel as='article' className='p-5 sm:p-8'>
      <CourseProgressBar value={progress} className='mb-6' />
      <p className='mb-2 text-sm font-semibold text-[#00a8f1]'>
        {labels.question} {index + 1}
      </p>
      <h2
        id={questionTitleId(question.id)}
        className='break-words text-xl font-bold leading-snug text-[#1e2364] sm:text-[28px] sm:leading-tight'
      >
        {translation?.text || `${labels.question} ${index + 1}`}
      </h2>
      {translation?.description && (
        <p className='mt-2 text-sm text-[#6b7196] sm:text-base'>
          {translation.description}
        </p>
      )}
      <div className='mt-6 sm:mt-8'>
        <QuestionBody question={question} {...interaction} />
      </div>
    </GlassPanel>
  );
}

function QuestionBody({
  question,
  ...interaction
}: { question: QuizQuestion } & QuestionInteraction) {
  const { labels, langId } = interaction;

  if (question.type === QuestionType.Video) {
    return (
      <div className='space-y-6'>
        {question.videoUrl && (
          <div className='overflow-hidden rounded-2xl bg-[#141848] shadow-[0_8px_32px_-12px_rgba(30,35,100,0.35)]'>
            <div className='relative aspect-video'>
              <iframe
                src={getVimeoEmbedUrl(question.videoUrl)}
                allow='autoplay; fullscreen; picture-in-picture'
                className='absolute inset-0 size-full'
                title='Quiz video'
              />
            </div>
          </div>
        )}
        <h3 className='flex items-center gap-2 border-t border-[#e5e7f0] pt-6 text-base font-bold text-[#1e2364] sm:text-xl'>
          <Target className='size-5 text-[#00a8f1]' aria-hidden />
          {labels.answerVideoQuestions}
        </h3>
        {(question.relatedQuizQuestions ?? []).map((sub, idx) => (
          <section
            key={sub.id}
            className='rounded-2xl border border-[#e5e7f0] bg-white/60 p-4 sm:p-5'
          >
            <p
              id={questionTitleId(sub.id)}
              className='mb-4 flex items-start gap-3 font-semibold text-[#1e2364]'
            >
              <span
                aria-hidden
                className='flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1e2364] text-xs font-bold text-white'
              >
                {idx + 1}
              </span>
              <span className='min-w-0 flex-1 break-words pt-0.5'>
                {getTranslation(sub.translations, langId)?.text ?? ''}
              </span>
            </p>
            <ChoiceOptions question={sub} {...interaction} />
          </section>
        ))}
      </div>
    );
  }

  return <ChoiceOptions question={question} {...interaction} />;
}

function ChoiceOptions({
  question,
  answers,
  langId,
  labels,
  shuffledRights,
  matchingSelection,
  onSingle,
  onToggle,
  onMatchingClick,
  onRemoveMatch,
}: { question: QuizQuestion } & QuestionInteraction) {
  if (question.type === QuestionType.Matching) {
    return (
      <MatchingQuestion
        question={question}
        answers={answers}
        langId={langId}
        labels={labels}
        shuffledRights={shuffledRights}
        matchingSelection={matchingSelection}
        onMatchingClick={onMatchingClick}
        onRemoveMatch={onRemoveMatch}
      />
    );
  }

  const state = answers[question.id];
  const isMultiple = question.type === QuestionType.MultipleChoice;
  const sorted = [...question.quizQuestionAnswers].sort(
    (a, b) => a.order - b.order
  );

  return (
    <fieldset aria-labelledby={questionTitleId(question.id)}>
      {isMultiple && (
        <p className='mb-4 inline-flex items-center gap-2 rounded-full bg-[#00a8f1]/10 px-3 py-1 text-sm font-semibold text-[#1e2364]'>
          <ListChecks className='size-4 text-[#00a8f1]' aria-hidden />
          {labels.selectAllThatApply}
        </p>
      )}
      <div className='space-y-3'>
        {sorted.map((answer) => {
          const active = isMultiple
            ? (state?.selectedAnswerIds ?? []).includes(answer.id)
            : state?.selectedAnswerId === answer.id;
          return (
            <OptionTile
              key={answer.id}
              type={isMultiple ? 'checkbox' : 'radio'}
              name={`quiz-question-${question.id}`}
              checked={active}
              onChange={() =>
                isMultiple
                  ? onToggle(question.id, answer.id)
                  : onSingle(question.id, answer.id)
              }
              marker={String.fromCharCode(65 + answer.order - 1)}
            >
              {answerLabel(answer, langId, labels)}
            </OptionTile>
          );
        })}
      </div>
    </fieldset>
  );
}
