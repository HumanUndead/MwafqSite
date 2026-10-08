import type { Ref } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Panel } from '@/shared/components/product';
import { interpolate } from '@/shared/lib/interpolate';
import { getTranslation } from '../../quizScoring.shared';
import { QuestionType } from '../../types/quiz.types';
import type { QuizQuestion } from '../../types/quiz.types';
import { getVimeoEmbedUrl } from '../../vimeo.shared';
import { MatchingQuestion } from './MatchingQuestion';
import { OptionTile } from './OptionTile';
import {
  answerLabel,
  questionTitleId,
  type QuestionInteraction,
} from './quizUi';

/** The one question in focus: position, text and its answers. */
export function QuestionCard({
  question,
  index,
  total,
  headingRef,
  ...interaction
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  /** Receives focus when the learner moves to another question. */
  headingRef?: Ref<HTMLHeadingElement>;
} & QuestionInteraction) {
  const { labels, langId } = interaction;
  const translation = getTranslation(question.translations, langId);
  const position = interpolate(labels.questionOf, {
    current: index + 1,
    total,
  });

  return (
    <Panel aria-labelledby={questionTitleId(question.id)} className='sm:p-7'>
      <p className='text-[13px] font-semibold tabular-nums text-[#6b7196]'>
        {position}
      </p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        id={questionTitleId(question.id)}
        className='mt-1.5 break-words text-[19px] font-bold leading-8 text-[#1e2364] outline-none sm:text-[22px]'
      >
        {translation?.text || `${labels.question} ${index + 1}`}
      </h2>
      {translation?.description ? (
        <p className='mt-2 break-words text-[15px] leading-6 text-[#4a5078]'>
          {translation.description}
        </p>
      ) : null}
      <div className='mt-6'>
        <QuestionBody question={question} {...interaction} />
      </div>
    </Panel>
  );
}

function QuestionBody({
  question,
  ...interaction
}: { question: QuizQuestion } & QuestionInteraction) {
  const { labels, langId } = interaction;

  if (question.type !== QuestionType.Video) {
    return <ChoiceOptions question={question} {...interaction} />;
  }

  const subs = question.relatedQuizQuestions ?? [];
  return (
    <div>
      {question.videoUrl ? (
        <div className='relative aspect-video overflow-hidden rounded-xl bg-[#141848]'>
          <iframe
            src={getVimeoEmbedUrl(question.videoUrl)}
            allow='autoplay; fullscreen; picture-in-picture'
            className='absolute inset-0 size-full'
            title={getTranslation(question.translations, langId)?.text || labels.question}
          />
        </div>
      ) : null}
      <h3 className='mt-6 text-[15px] font-bold text-[#1e2364]'>
        {labels.answerVideoQuestions}
      </h3>
      <ol className='mt-2 divide-y divide-[#eef0f7]'>
        {subs.map((sub, idx) => (
          <li key={sub.id} className='py-5 last:pb-0'>
            <p
              id={questionTitleId(sub.id)}
              className='mb-4 break-words text-[16px] font-semibold leading-7 text-[#1e2364]'
            >
              <span className='tabular-nums text-[#6b7196]'>{idx + 1}. </span>
              {getTranslation(sub.translations, langId)?.text ?? ''}
            </p>
            <ChoiceOptions question={sub} {...interaction} />
          </li>
        ))}
      </ol>
    </div>
  );
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
  const sorted = [...question.quizQuestionAnswers].sort(
    (a, b) => a.order - b.order
  );

  if (question.type === QuestionType.MultipleChoice) {
    const selected = state?.selectedAnswerIds ?? [];
    return (
      <div role='group' aria-labelledby={questionTitleId(question.id)}>
        <p className='mb-3 text-[13px] font-semibold text-[#4a5078]'>
          {labels.selectAllThatApply}
        </p>
        <div className='space-y-2.5'>
          {sorted.map((answer) => (
            <OptionTile
              key={answer.id}
              type='checkbox'
              checked={selected.includes(answer.id)}
              onToggle={() => onToggle(question.id, answer.id)}
            >
              {answerLabel(answer, langId, labels)}
            </OptionTile>
          ))}
        </div>
      </div>
    );
  }

  return (
    <RadioGroup
      aria-labelledby={questionTitleId(question.id)}
      value={state?.selectedAnswerId ?? null}
      onValueChange={(value) => {
        if (typeof value === 'number') onSingle(question.id, value);
      }}
      className='gap-2.5'
    >
      {sorted.map((answer) => (
        <OptionTile
          key={answer.id}
          type='radio'
          value={answer.id}
          checked={state?.selectedAnswerId === answer.id}
        >
          {answerLabel(answer, langId, labels)}
        </OptionTile>
      ))}
    </RadioGroup>
  );
}
