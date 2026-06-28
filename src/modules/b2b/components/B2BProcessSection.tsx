'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';

interface Stage {
  number: string;
  title: string;
  description: string;
}
interface JourneyContent {
  eyebrow: string;
  title: string;
  stages: Stage[];
}

const CONTENT: Record<string, JourneyContent> = {
  en: {
    eyebrow: 'How it works',
    title: 'The Mwafq Journey',
    stages: [
      {
        number: '01',
        title: 'Register',
        description:
          'Create your company account in minutes — verify your CR number and you are instantly ready to operate.',
      },
      {
        number: '02',
        title: 'Set Up Your Team',
        description:
          'Upload employees in bulk, assign departments, and configure approval workflows to match your HR structure.',
      },
      {
        number: '03',
        title: 'Book Services',
        description:
          'Schedule medical exams, certifications, and visa health checks in a single click — no paperwork, no waiting.',
      },
      {
        number: '04',
        title: 'Track in Real Time',
        description:
          'Follow every request from submission to delivery. Get instant alerts and a unified dashboard for your entire workforce.',
      },
      {
        number: '05',
        title: 'Scale with Confidence',
        description:
          'As your workforce expands, Mwafq grows with you — automated policy renewals, workforce analytics, and export-ready compliance reports for auditors and regulators.',
      },
    ],
  },
  ar: {
    eyebrow: 'كيف يعمل',
    title: 'رحلة موفق',
    stages: [
      {
        number: '٠١',
        title: 'التسجيل',
        description:
          'أنشئ حساب شركتك في دقائق — تحقق من رقم السجل التجاري وابدأ الفور.',
      },
      {
        number: '٠٢',
        title: 'إعداد فريقك',
        description:
          'أضف الموظفين دفعةً واحدة، وحدد الأقسام، وأتمت مسارات الموافقة لتتناسب مع هيكل مواردك البشرية.',
      },
      {
        number: '٠٣',
        title: 'حجز الخدمات',
        description:
          'احجز الفحوصات الطبية والشهادات وفحوصات تأشيرة الصحة في نقرة واحدة — بلا أوراق ولا انتظار.',
      },
      {
        number: '٠٤',
        title: 'التتبع اللحظي',
        description:
          'تابع كل طلب من الإرسال حتى التسليم، واحصل على تنبيهات فورية ولوحة تحكم موحدة لكامل القوى العاملة.',
      },
      {
        number: '٠٥',
        title: 'التوسع بثقة',
        description:
          'مع توسع قواك العاملة تنمو موفق معك — تجديدات تلقائية للوثائق، وتحليلات للقوى العاملة، وتقارير امتثال جاهزة للتصدير للمراجعين والجهات الرقابية.',
      },
    ],
  },
};

const STAGE_META = [
  { nodeX: 2100, nodeY: 230, side: 'right' as const },
  { nodeX: 100, nodeY: 460, side: 'left' as const },
  { nodeX: 2100, nodeY: 670, side: 'right' as const },
  { nodeX: 100, nodeY: 855, side: 'left' as const },
  { nodeX: 1100, nodeY: 970, side: 'right' as const },
];

const PATH_D = [
  'M 1100,40',
  'C 1100,130 2100,140 2100,230',
  'C 2100,340 100,370  100,460',
  'C 100,560  2100,590 2100,670',
  'C 2100,760 100,790  100,855',
  'C 100,920  1100,960 1100,970',
].join(' ');

const FINALE_THRESHOLD = 0.92;
const STAGE_INTRO = 0.02;
const STAGE_STEP = (FINALE_THRESHOLD - STAGE_INTRO) / 5;
const STAGE_THRESHOLDS = [
  STAGE_INTRO,
  STAGE_INTRO + STAGE_STEP,
  STAGE_INTRO + STAGE_STEP * 2,
  STAGE_INTRO + STAGE_STEP * 3,
  STAGE_INTRO + STAGE_STEP * 4,
] as const;

const NODE_CAMERAS = [
  { x: 1000, y: 0 },
  { x: 0, y: 160 },
  { x: 1000, y: 370 },
  { x: 0, y: 400 },
  { x: 500, y: 620 },
] as const;
const CAM_INTRO = { x: 500, y: 0 };

const CAM_PROGRESS = [
  0,
  STAGE_THRESHOLDS[1],
  STAGE_THRESHOLDS[2],
  STAGE_THRESHOLDS[3],
  STAGE_THRESHOLDS[4],
  FINALE_THRESHOLD,
  1,
];
const CAM_X = [CAM_INTRO.x, ...NODE_CAMERAS.map((c) => c.x), -640];
const CAM_Y = [CAM_INTRO.y, ...NODE_CAMERAS.map((c) => c.y), 0];
const CAM_W = [1200, 1200, 1200, 1200, 1200, 1200, 3480];
const CAM_H = [1000, 600, 600, 600, 600, 600, 1000];

const SECTION_HEIGHT = '2600vh';
const RING_R = 22;
const LABEL_W = 460;
const LABEL_H = 176;
const LABEL_GAP = 130;
const FINALE_LABEL_W = 640;
const FINALE_LABEL_H = 252;
const FINALE_LABEL_GAP = 52;
const FINALE_LABEL_GAP_LAST = 100;

type LabelLayout = {
  foX: number;
  foY: number;
  foW: number;
  foH: number;
  lx1: number;
  ly1: number;
  lx2: number;
  ly2: number;
  padTowardNode?: 'start' | 'end';
};

function getStageLabelLayout(index: number): LabelLayout {
  const meta = STAGE_META[index]!;
  const foY = meta.nodeY - LABEL_H / 2;

  if (index === 4) {
    const foX = meta.nodeX + RING_R + LABEL_GAP;
    return {
      foX,
      foY,
      foW: LABEL_W,
      foH: LABEL_H,
      lx1: meta.nodeX + RING_R,
      ly1: meta.nodeY,
      lx2: foX,
      ly2: meta.nodeY,
    };
  }

  if (meta.side === 'right') {
    const foX = meta.nodeX - LABEL_GAP - LABEL_W;
    return {
      foX,
      foY,
      foW: LABEL_W,
      foH: LABEL_H,
      lx1: meta.nodeX - RING_R,
      ly1: meta.nodeY,
      lx2: foX + LABEL_W,
      ly2: meta.nodeY,
    };
  }

  const foX = meta.nodeX + RING_R + LABEL_GAP;
  return {
    foX,
    foY,
    foW: LABEL_W,
    foH: LABEL_H,
    lx1: meta.nodeX + RING_R,
    ly1: meta.nodeY,
    lx2: foX,
    ly2: meta.nodeY,
  };
}

function getFinaleLabelLayout(index: number): LabelLayout {
  const meta = STAGE_META[index]!;
  const w = FINALE_LABEL_W;
  const h = FINALE_LABEL_H;
  const gap = index === 4 ? FINALE_LABEL_GAP_LAST : FINALE_LABEL_GAP;
  const foY = meta.nodeY - h / 2;

  if (index === 4) {
    const foX = meta.nodeX + RING_R + gap;
    return {
      foX,
      foY: meta.nodeY - h / 2 - 12,
      foW: w,
      foH: h,
      lx1: meta.nodeX + RING_R,
      ly1: meta.nodeY,
      lx2: foX,
      ly2: meta.nodeY,
      padTowardNode: 'start',
    };
  }

  if (meta.side === 'right') {
    const foX = meta.nodeX + RING_R + gap;
    return {
      foX,
      foY,
      foW: w,
      foH: h,
      lx1: meta.nodeX + RING_R,
      ly1: meta.nodeY,
      lx2: foX,
      ly2: meta.nodeY,
      padTowardNode: 'start',
    };
  }

  const foX = meta.nodeX - gap - w;
  return {
    foX,
    foY,
    foW: w,
    foH: h,
    lx1: meta.nodeX - RING_R,
    ly1: meta.nodeY,
    lx2: foX + w,
    ly2: meta.nodeY,
    padTowardNode: 'end',
  };
}

function mapScrollToPathProgress(scroll: number): number {
  if (scroll <= STAGE_INTRO) return 0;
  if (scroll >= FINALE_THRESHOLD) return 1;

  for (let i = 0; i < 5; i++) {
    const legStart = STAGE_THRESHOLDS[i]!;
    const legEnd = i < 4 ? STAGE_THRESHOLDS[i + 1]! : FINALE_THRESHOLD;
    if (scroll <= legEnd) {
      const t = (scroll - legStart) / (legEnd - legStart);
      return i * 0.2 + t * 0.2;
    }
  }

  return 1;
}

function getActiveLabelIndex(
  scrollProgress: number,
  pathProgress: number
): number {
  if (scrollProgress >= FINALE_THRESHOLD) return -1;
  if (pathProgress <= 0) return -1;

  if (pathProgress <= 0.2) return 0;
  if (pathProgress <= 0.4) return 1;
  if (pathProgress <= 0.6) return 2;
  if (pathProgress <= 0.8) return 3;
  return 4;
}

const ELLIPSE_BG = `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700' fill='none' stroke='%23d3d6e1' stroke-width='1'%3E%3Cellipse cx='800' cy='720' rx='220' ry='90'/%3E%3Cellipse cx='800' cy='720' rx='320' ry='130'/%3E%3Cellipse cx='800' cy='720' rx='430' ry='170'/%3E%3Cellipse cx='800' cy='720' rx='550' ry='215'/%3E%3Cellipse cx='800' cy='720' rx='680' ry='265'/%3E%3Cellipse cx='800' cy='720' rx='820' ry='320'/%3E%3Cellipse cx='800' cy='720' rx='970' ry='380'/%3E%3C/svg%3E")`;

function getStageState(
  progress: number,
  index: number
): 'upcoming' | 'active' | 'completed' {
  const threshold = STAGE_THRESHOLDS[index];
  const next = STAGE_THRESHOLDS[index + 1];
  if (progress < threshold) return 'upcoming';
  if (next !== undefined && progress >= next) return 'completed';
  return 'active';
}

function StageLabelContent({
  stage,
  total,
  rtl,
  size = 'active',
  padTowardNode,
}: {
  stage: Stage;
  total: number;
  rtl: boolean;
  size?: 'active' | 'finale';
  padTowardNode?: 'start' | 'end';
}) {
  const isFinale = size === 'finale';
  const padInner = isFinale ? 20 : 20;
  const padOuter = isFinale ? 16 : 20;
  const padBlock = isFinale ? 12 : 0;

  const paddingStyle =
    isFinale && padTowardNode
      ? padTowardNode === 'start'
        ? {
            paddingTop: padBlock,
            paddingBottom: padBlock,
            paddingInlineStart: padInner,
            paddingInlineEnd: padOuter,
          }
        : {
            paddingTop: padBlock,
            paddingBottom: padBlock,
            paddingInlineStart: padOuter,
            paddingInlineEnd: padInner,
          }
      : { padding: `0 ${padOuter}px` };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: rtl ? 'right' : 'left',
        direction: rtl ? 'rtl' : 'ltr',
        boxSizing: 'border-box',
        ...paddingStyle,
      }}
    >
      <span
        style={{
          display: 'block',
          fontSize: isFinale ? '16px' : '10px',
          letterSpacing: isFinale ? '0.28em' : '0.32em',
          textTransform: 'uppercase',
          color: '#00a8f1',
          fontFamily: 'ui-monospace, monospace',
          marginBottom: isFinale ? '10px' : '8px',
        }}
      >
        {stage.number} / 0{total}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: isFinale ? '42px' : '26px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#1e2364',
          marginBottom: isFinale ? '12px' : '8px',
        }}
      >
        {stage.title}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: isFinale ? '21px' : '14px',
          lineHeight: isFinale ? 1.5 : 1.55,
          color: '#6b7196',
        }}
      >
        {stage.description}
      </span>
    </div>
  );
}

function MobileJourney({
  eyebrow,
  title,
  stages,
  rtl,
}: {
  eyebrow: string;
  title: string;
  stages: Stage[];
  rtl: boolean;
}) {
  return (
    <section
      className='bg-[#f4f4f6] px-5 py-14 sm:px-8'
      aria-label={title}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-30'
        style={{
          backgroundImage: ELLIPSE_BG,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          backgroundSize: '120% auto',
        }}
      />

      <div className='relative mb-10 flex flex-col items-center gap-2 text-center'>
        <div className='flex items-center gap-2'>
          <div className='h-px w-6 bg-[#00a8f1]' />
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(30,35,100,0.4)',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {eyebrow}
          </span>
          <div className='h-px w-6 bg-[#00a8f1]' />
        </div>
        <h2
          className='font-extrabold leading-none tracking-[-1px] text-[#1e2364]'
          style={{ fontSize: 'clamp(24px, 6vw, 36px)' }}
        >
          {title}
        </h2>
      </div>

      <div className='relative mx-auto max-w-lg'>
        <div
          aria-hidden
          className='absolute top-0 bottom-0 w-px bg-gradient-to-b from-[#00a8f1]/60 via-[#1e2364]/20 to-transparent'
          style={{ [rtl ? 'right' : 'left']: '19px' }}
        />

        <ol className='flex flex-col gap-8'>
          {stages.map((stage, i) => (
            <MobileStep
              key={i}
              stage={stage}
              index={i}
              rtl={rtl}
              total={stages.length}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function MobileStep({
  stage,
  index,
  rtl,
  total,
}: {
  stage: { number: string; title: string; description: string };
  index: number;
  rtl: boolean;
  total: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.05 * index,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className='relative flex items-start gap-4'
      style={{ flexDirection: rtl ? 'row-reverse' : 'row' }}
    >
      <div className='relative shrink-0'>
        <div
          className='flex size-10 items-center justify-center rounded-full border-2 bg-white text-[11px] font-extrabold'
          style={{
            borderColor: '#00a8f1',
            color: '#00a8f1',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
      </div>

      <div className={`pb-1 pt-0.5 flex-1 ${rtl ? 'text-right' : ''}`}>
        <span
          className='mb-0.5 block'
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#00a8f1',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {stage.number} / 0{total}
        </span>
        <h3 className='mb-1.5 text-[18px] font-extrabold leading-tight tracking-[-0.4px] text-[#1e2364]'>
          {stage.title}
        </h3>
        <p className='text-[13px] leading-relaxed text-[#6b7196]'>
          {stage.description}
        </p>
      </div>
    </motion.li>
  );
}

interface Props {
  locale: Locale;
}

export function B2BProcessSection({ locale }: Props) {
  const rtl = isRtl(locale);
  const content = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en;
  const { eyebrow, title, stages } = content;

  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [pathLength, setPathLength] = useState(9999);
  const [leadingPoint, setLeadingPoint] = useState({ x: 1100, y: 40 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollMV = useMotionValue(0);
  const camX = useTransform(scrollMV, CAM_PROGRESS, CAM_X);
  const camY = useTransform(scrollMV, CAM_PROGRESS, CAM_Y);
  const camW = useTransform(scrollMV, CAM_PROGRESS, CAM_W);
  const camH = useTransform(scrollMV, CAM_PROGRESS, CAM_H);
  const viewBox = useMotionTemplate`${camX} ${camY} ${camW} ${camH}`;

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current || !pathRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sH = sectionRef.current.offsetHeight;
      const vh = window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (sH - vh)));

      setScrollProgress(progress);
      scrollMV.set(progress);

      const pathProgress = mapScrollToPathProgress(progress);

      if (pathLength < 9999) {
        const len = pathRef.current.getTotalLength();
        const pt = pathRef.current.getPointAtLength(len * pathProgress);
        setLeadingPoint({ x: pt.x, y: pt.y });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathLength, scrollMV]);

  const dashOffset = pathLength * (1 - mapScrollToPathProgress(scrollProgress));
  const pathProgress = mapScrollToPathProgress(scrollProgress);
  const activeLabelIndex = getActiveLabelIndex(scrollProgress, pathProgress);

  return (
    <>
      <div className='lg:hidden relative overflow-hidden'>
        <MobileJourney
          eyebrow={eyebrow}
          title={title}
          stages={stages}
          rtl={rtl}
        />
      </div>

      <div
        ref={sectionRef}
        className='relative hidden lg:block'
        style={{ height: SECTION_HEIGHT }}
        aria-label={title}
      >
        <div className='sticky top-0 z-[201] h-dvh flex flex-col overflow-hidden bg-[#f4f4f6]'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 opacity-[0.42]'
            style={{
              backgroundImage: ELLIPSE_BG,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center 75%',
              backgroundSize: '1700px auto',
            }}
          />

          <div className='relative z-10 flex flex-col items-center pt-10 pb-3 shrink-0'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='h-px w-8 bg-[#00a8f1]' />
              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: 'rgba(30,35,100,0.4)',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {eyebrow}
              </span>
              <div className='h-px w-8 bg-[#00a8f1]' />
            </div>
            <h2
              className='font-extrabold leading-none tracking-[-1px] text-[#1e2364]'
              style={{ fontSize: 'clamp(26px,3vw,44px)' }}
            >
              {title}
            </h2>
          </div>

          <div className='relative flex-1 min-h-0'>
            <motion.svg
              viewBox={viewBox as unknown as string}
              className='absolute inset-0 w-full h-full'
              preserveAspectRatio='xMidYMid meet'
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id='mjGrad' x1='0%' y1='0%' x2='0%' y2='100%'>
                  <stop offset='0%' stopColor='#1e2364' />
                  <stop offset='100%' stopColor='#00a8f1' />
                </linearGradient>
                <filter
                  id='mjNodeGlw'
                  x='-150%'
                  y='-150%'
                  width='400%'
                  height='400%'
                >
                  <feGaussianBlur stdDeviation='5' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
                <filter
                  id='mjDotGlw'
                  x='-400%'
                  y='-400%'
                  width='900%'
                  height='900%'
                >
                  <feGaussianBlur stdDeviation='4' result='b1' />
                  <feGaussianBlur
                    stdDeviation='2'
                    in='SourceGraphic'
                    result='b2'
                  />
                  <feMerge>
                    <feMergeNode in='b1' />
                    <feMergeNode in='b2' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
              </defs>

              <path
                ref={pathRef}
                d={PATH_D}
                fill='none'
                stroke='url(#mjGrad)'
                strokeWidth='2.4'
                strokeLinecap='round'
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: dashOffset,
                }}
              />

              {scrollProgress > 0.005 && scrollProgress < 0.998 && (
                <circle
                  cx={leadingPoint.x}
                  cy={leadingPoint.y}
                  r={6}
                  fill='#00a8f1'
                  filter='url(#mjDotGlw)'
                />
              )}

              {stages.map((stage, i) => {
                const meta = STAGE_META[i]!;
                const state = getStageState(scrollProgress, i);
                const isActive = state === 'active';
                const isCompleted = state === 'completed';
                const isFinale = scrollProgress >= FINALE_THRESHOLD;
                const nodeAlpha = isFinale
                  ? 1
                  : isActive
                    ? 1
                    : isCompleted
                      ? 0.38
                      : 0;

                return (
                  <g key={i}>
                    <motion.circle
                      cx={meta.nodeX}
                      cy={meta.nodeY}
                      r={RING_R + 8}
                      fill='none'
                      stroke='#00a8f1'
                      strokeWidth='1'
                      animate={
                        isActive
                          ? { r: [RING_R + 4, RING_R + 34], opacity: [0.55, 0] }
                          : { opacity: 0, r: RING_R + 4 }
                      }
                      transition={
                        isActive
                          ? { duration: 2.2, repeat: Infinity, ease: 'easeOut' }
                          : { duration: 0.3 }
                      }
                    />
                    <motion.circle
                      cx={meta.nodeX}
                      cy={meta.nodeY}
                      r={RING_R + 8}
                      fill='none'
                      stroke='#00a8f1'
                      strokeWidth='0.6'
                      animate={
                        isActive
                          ? { r: [RING_R + 2, RING_R + 50], opacity: [0.35, 0] }
                          : { opacity: 0, r: RING_R + 2 }
                      }
                      transition={
                        isActive
                          ? {
                              duration: 2.2,
                              repeat: Infinity,
                              ease: 'easeOut',
                              delay: 0.55,
                            }
                          : { duration: 0.3 }
                      }
                    />
                    <circle
                      cx={meta.nodeX}
                      cy={meta.nodeY}
                      r={RING_R}
                      fill='none'
                      stroke={
                        isActive
                          ? '#00a8f1'
                          : isCompleted
                            ? 'rgba(0,168,241,0.4)'
                            : 'rgba(30,35,100,0.12)'
                      }
                      strokeWidth={isActive ? 1.8 : 1}
                      opacity={nodeAlpha}
                      filter={isActive ? 'url(#mjNodeGlw)' : undefined}
                      style={{
                        transition: 'stroke 0.6s ease, opacity 0.6s ease',
                      }}
                    />
                    <circle
                      cx={meta.nodeX}
                      cy={meta.nodeY}
                      r={isActive ? 10 : 5}
                      fill={
                        isActive
                          ? '#00a8f1'
                          : isCompleted
                            ? 'rgba(0,168,241,0.5)'
                            : 'rgba(30,35,100,0.12)'
                      }
                      opacity={nodeAlpha}
                      style={{
                        transition:
                          'all 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
                      }}
                    />
                  </g>
                );
              })}

              {scrollProgress < FINALE_THRESHOLD && activeLabelIndex >= 0 && (
                <AnimatePresence mode='wait'>
                  <motion.g
                    key={activeLabelIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.45,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    {(() => {
                      const layout = getStageLabelLayout(activeLabelIndex);
                      const stage = stages[activeLabelIndex]!;
                      return (
                        <>
                          <line
                            x1={layout.lx1}
                            y1={layout.ly1}
                            x2={layout.lx2}
                            y2={layout.ly2}
                            stroke='rgba(0,168,241,0.45)'
                            strokeWidth='1'
                          />
                          <foreignObject
                            x={layout.foX}
                            y={layout.foY}
                            width={layout.foW}
                            height={layout.foH}
                          >
                            <StageLabelContent
                              stage={stage}
                              total={stages.length}
                              rtl={rtl}
                            />
                          </foreignObject>
                        </>
                      );
                    })()}
                  </motion.g>
                </AnimatePresence>
              )}

              {stages.map((stage, i) => {
                const isFinale = scrollProgress >= FINALE_THRESHOLD;
                const layout = getFinaleLabelLayout(i);
                return (
                  <motion.g
                    key={`finale-label-${i}`}
                    initial={false}
                    animate={{ opacity: isFinale ? 1 : 0 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: isFinale ? 0.08 + i * 0.07 : 0,
                    }}
                  >
                    <line
                      x1={layout.lx1}
                      y1={layout.ly1}
                      x2={layout.lx2}
                      y2={layout.ly2}
                      stroke='rgba(0,168,241,0.35)'
                      strokeWidth='1'
                      strokeDasharray='3 4'
                    />
                    <foreignObject
                      x={layout.foX}
                      y={layout.foY}
                      width={layout.foW}
                      height={layout.foH}
                    >
                      <StageLabelContent
                        stage={stage}
                        total={stages.length}
                        rtl={rtl}
                        size='finale'
                        padTowardNode={layout.padTowardNode}
                      />
                    </foreignObject>
                  </motion.g>
                );
              })}
            </motion.svg>
          </div>
        </div>
      </div>
    </>
  );
}
