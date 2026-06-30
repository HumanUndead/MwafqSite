import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { Eyebrow } from './Eyebrow';
import { cn } from '@/shared/lib/cn';
import { marketingSectionShellClass } from '@/shared/components/marketing/marketingLayout';

/**
 * Mwafq Academy showcase. Design inspired by the legacy {@link B2BSection}
 * (dark split layout + right-side "mock dashboard" card).
 *
 * Content is hardcoded for now so the section renders without the CMS.
 * Once the backend is ready, lift `ACADEMY_CONTENT` into `HomeAcademyContent`
 * and pass it in as a `content` prop, mirroring the other home sections.
 */

type StatusTone = 'done' | 'progress' | 'new';

interface AcademyLesson {
  title: string;
  meta: string;
  statusLabel: string;
  tone: StatusTone;
}

interface AcademyMetric {
  value: string;
  label: string;
}

interface AcademyContent {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
  points: string[];
  primaryLabel: string;
  secondaryLabel: string;
  card: {
    tabs: string[];
    continueLabel: string;
    featuredTitle: string;
    instructorLabel: string;
    instructor: string;
    progress: number;
    progressLabel: string;
    metrics: AcademyMetric[];
    lessons: AcademyLesson[];
  };
}

const ACADEMY_CONTENT: Record<Locale, AcademyContent> = {
  en: {
    eyebrow: 'Mwafq Academy',
    title: 'Learn the skills that',
    accent: 'keep care compliant',
    body: 'Mwafq Academy turns medical and occupational-health expertise into structured, certified courses. Upskill your team, stay ahead of regulation, and learn at your own pace — every lesson built and reviewed by licensed professionals.',
    points: [
      'Accredited courses authored by licensed medical experts',
      'Self-paced video lessons modeled on real exam scenarios',
      'Verifiable certificates issued on every completion',
      'One dashboard to track every learner’s progress',
    ],
    primaryLabel: 'Browse courses',
    secondaryLabel: 'Teach on Mwafq',
    card: {
      tabs: ['My learning', 'Catalog', 'Certified'],
      continueLabel: 'Continue',
      featuredTitle: 'Occupational Health & Safety Essentials',
      instructorLabel: 'Instructor',
      instructor: 'Dr. Layla Hassan',
      progress: 68,
      progressLabel: '68% complete',
      metrics: [
        { value: '120+', label: 'Courses' },
        { value: '8.5k', label: 'Learners' },
        { value: '95%', label: 'Pass rate' },
      ],
      lessons: [
        {
          title: 'Workplace Risk Assessment',
          meta: 'Module 03',
          statusLabel: 'Completed',
          tone: 'done',
        },
        {
          title: 'Pre-Employment Screening',
          meta: 'Module 04',
          statusLabel: 'In progress',
          tone: 'progress',
        },
        {
          title: 'Reporting & Compliance',
          meta: 'Module 05',
          statusLabel: 'New',
          tone: 'new',
        },
      ],
    },
  },
  ar: {
    eyebrow: 'أكاديمية موفق',
    title: 'تعلّم المهارات التي',
    accent: 'تُبقي الرعاية متوافقة',
    body: 'تحوّل أكاديمية موفق الخبرة الطبية وخبرة الصحة المهنية إلى دورات منظّمة ومعتمدة. طوّر مهارات فريقك، واسبق المتطلبات التنظيمية، وتعلّم وفق إيقاعك الخاص — كل درس يُعدّه ويراجعه مختصون مرخّصون.',
    points: [
      'دورات معتمدة من إعداد خبراء طبيين مرخّصين',
      'دروس فيديو ذاتية مبنية على سيناريوهات فحص واقعية',
      'شهادات قابلة للتحقق تُمنح عند كل إتمام',
      'لوحة واحدة لمتابعة تقدّم كل متعلّم',
    ],
    primaryLabel: 'تصفّح الدورات',
    secondaryLabel: 'درّس عبر موفق',
    card: {
      tabs: ['تعلّمي', 'الكتالوج', 'المعتمدة'],
      continueLabel: 'متابعة',
      featuredTitle: 'أساسيات الصحة والسلامة المهنية',
      instructorLabel: 'المدرّب',
      instructor: 'د. ليلى حسن',
      progress: 68,
      progressLabel: '68% مكتمل',
      metrics: [
        { value: '+120', label: 'دورة' },
        { value: '8.5k', label: 'متعلّم' },
        { value: '95%', label: 'نسبة النجاح' },
      ],
      lessons: [
        {
          title: 'تقييم مخاطر بيئة العمل',
          meta: 'الوحدة 03',
          statusLabel: 'مكتمل',
          tone: 'done',
        },
        {
          title: 'الفحص قبل التوظيف',
          meta: 'الوحدة 04',
          statusLabel: 'قيد التقدّم',
          tone: 'progress',
        },
        {
          title: 'التقارير والامتثال',
          meta: 'الوحدة 05',
          statusLabel: 'جديد',
          tone: 'new',
        },
      ],
    },
  },
};

const STATUS_TONE_CLASS: Record<StatusTone, string> = {
  done: 'border-transparent bg-[rgba(0,222,201,0.14)] text-[#00867a]',
  progress: 'border-transparent bg-[rgba(217,116,60,0.14)] text-[#a65528]',
  new: 'border-transparent bg-[rgba(111,143,207,0.16)] text-[#4a6cb8]',
};

const METRIC_BARS = [30, 55, 40, 80, 60, 90, 70];
const METRIC_VALUE_COLOR = ['text-[#1e2364]', 'text-[#00dec9]', 'text-[#d9743c]'];
const METRIC_BAR_COLOR = ['#00a8f1', '#00dec9', '#EBA277'];

interface Props {
  locale: Locale;
}

export function MwafqAcademySection({ locale }: Props) {
  const content = ACADEMY_CONTENT[locale] ?? ACADEMY_CONTENT.en;
  const { card } = content;
  const coursesHref = getLocalizedRoute(locale, ROUTES.COURSES);
  const teachHref = getLocalizedRoute(locale, ROUTES.CONTACT);

  return (
    <section
      id='academy'
      className='relative overflow-hidden border-t-2 border-[#e5e7f0] px-4 py-8 text-white md:px-7 md:py-14'
      style={{
        background:
          'radial-gradient(circle at 80% 25%, rgba(0,168,241,0.42), transparent 45%), radial-gradient(circle at 18% 78%, rgba(116,47,136,0.45), transparent 45%), radial-gradient(circle at 50% 60%, rgba(35,53,103,0.25), transparent 50%), #1e2364',
      }}
    >
      <div
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1.2px,transparent_1.2px)] bg-size-[24px_24px]'
        aria-hidden='true'
      />
      <div className={cn('relative z-10', marketingSectionShellClass)}>
        <div className='grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20'>
          {/* Copy */}
          <div>
            <Eyebrow dark>{content.eyebrow}</Eyebrow>
            <h2 className='mb-7 text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.08] tracking-[-1.6px] text-white'>
              {content.title}
              <br />
              <span className='font-normal italic text-white/55'>
                {content.accent}
              </span>
            </h2>
            <p className='mb-7 text-[16px] leading-[1.65] text-white/82'>
              {content.body}
            </p>
            <ul className='mb-8 flex flex-col gap-3.5'>
              {content.points.map((point) => (
                <li
                  key={point}
                  className='flex items-center gap-3.5 text-[15.5px] text-white/92'
                >
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='h-4 w-4 shrink-0 text-[#00dec9]'
                    aria-hidden='true'
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
            <div className='flex flex-wrap gap-3.5'>
              <Link
                href={coursesHref}
                className='inline-flex items-center gap-2 rounded-full bg-[#00a8f1] px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:bg-[#0090d1]'
              >
                {content.primaryLabel}
              </Link>
              <Link
                href={teachHref}
                className='inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-transparent px-[30px] py-4 text-[14.5px] font-semibold text-white transition hover:border-white/60'
              >
                {content.secondaryLabel}
              </Link>
            </div>
          </div>

          {/* Learning dashboard mock */}
          <div className='rounded-[32px_4px_32px_4px] border-2 border-[#e5e7f0] bg-white p-7.5 text-[#1e2364]'>
            <div className='mb-5.5 w-fit rounded-full bg-[#f2f2f2] p-1.25'>
              {card.tabs.map((tab, index) => (
                <span
                  key={`${tab}-${index}`}
                  className={`inline-block rounded-full px-4 py-2 text-[12px] font-semibold ${index === 0 ? 'bg-white text-[#1e2364]' : 'bg-transparent text-[#6b7196]'}`}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* Featured "continue learning" course */}
            <div className='mb-5.5 flex items-center gap-3.5 rounded-[16px_4px_16px_4px] border-2 border-[#e5e7f0] bg-[#fbfcff] p-4'>
              <div
                className='flex size-12 shrink-0 items-center justify-center rounded-[12px_4px_12px_4px] text-white'
                style={{
                  background:
                    'linear-gradient(135deg, #00a8f1 0%, #2f3567 100%)',
                }}
                aria-hidden='true'
              >
                <svg
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='h-5 w-5'
                  aria-hidden='true'
                >
                  <path d='M8 5v14l11-7z' />
                </svg>
              </div>
              <div className='min-w-0 flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <span className='rounded-full bg-[rgba(0,168,241,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.4px] text-[#00a8f1]'>
                    {card.continueLabel}
                  </span>
                  <span className='text-[11px] font-semibold text-[#6b7196]'>
                    {card.progressLabel}
                  </span>
                </div>
                <strong className='block truncate text-[13.5px] font-bold tracking-[-0.2px] text-[#1e2364]'>
                  {card.featuredTitle}
                </strong>
                <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7f0]'>
                  <div
                    className='h-full rounded-full bg-[#00a8f1]'
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metric tiles */}
            <div className='mb-5.5 grid grid-cols-3 gap-2 sm:gap-3.5'>
              {card.metrics.map((metric, index) => (
                <div
                  key={`${metric.label}-${index}`}
                  className='rounded-[16px_4px_16px_4px] border-2 border-[#e5e7f0] bg-white p-4.5'
                >
                  <div
                    className={`text-[26px] font-extrabold leading-none tracking-[-1px] ${METRIC_VALUE_COLOR[index] ?? METRIC_VALUE_COLOR[0]}`}
                  >
                    {metric.value}
                  </div>
                  <div className='mt-1.5 text-[12px] text-[#6b7196]'>
                    {metric.label}
                  </div>
                  <div className='mt-2.5 flex h-7.5 items-end gap-0.75'>
                    {METRIC_BARS.map((height, barIndex) => (
                      <div
                        key={barIndex}
                        className='flex-1 rounded-t-[3px]'
                        style={{
                          height: `${height}%`,
                          background:
                            METRIC_BAR_COLOR[index] ?? METRIC_BAR_COLOR[0],
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Lesson rows */}
            {card.lessons.map((lesson, index) => (
              <div
                key={`${lesson.title}-${index}`}
                className='mb-2 flex items-center gap-3 rounded-[14px] border-2 border-[#e5e7f0] bg-white px-3.5 py-2.75'
              >
                <div
                  className='size-9.5 shrink-0 rounded-full bg-[#f2f3f7]'
                  aria-hidden='true'
                />
                <div className='min-w-0 flex-1'>
                  <strong className='block text-[13px] font-bold tracking-[-0.2px] text-[#1e2364]'>
                    {lesson.title}
                  </strong>
                  <span className='text-[11px] text-[#6b7196]'>
                    {lesson.meta}
                  </span>
                </div>
                <span
                  className={`rounded-full border-2 px-2.5 py-1.25 text-[10px] font-bold uppercase tracking-[0.4px] ${STATUS_TONE_CLASS[lesson.tone]}`}
                >
                  {lesson.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
