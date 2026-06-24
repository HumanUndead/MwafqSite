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

// ─── Bilingual content ────────────────────────────────────────────────────────
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
          'As your team grows, Mwafq scales with you — automated renewals, deep analytics, and direct compliance reporting.',
      },
    ],
  },
  ar: {
    eyebrow: 'كيف يعمل',
    title: 'رحلة مَوافق',
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
          'مع نمو فريقك تنمو مَوافق معك — تجديدات تلقائية وتحليلات عميقة وتقارير امتثال مباشرة.',
      },
    ],
  },
};

// ─── SVG geometry (unchanged) ─────────────────────────────────────────────────
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

const CAM_PROGRESS = [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0];
const CAM_X = [500, 1000, 0, 1000, 0, 500, 0];
const CAM_Y = [0, 0, 160, 370, 400, 500, 0];
const CAM_W = [1200, 1200, 1200, 1200, 1200, 1200, 2200];
const CAM_H = [1000, 600, 600, 600, 600, 600, 1000];

const SECTION_HEIGHT = '2600vh';
const STAGE_THRESHOLDS = [0.1, 0.3, 0.5, 0.7, 0.85];
const FINALE_THRESHOLD = 0.9;
const RING_R = 22;

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

// ─── Story panel (desktop only) ───────────────────────────────────────────────
function StoryPanel({
  activeIndex,
  stages,
  rtl,
}: {
  activeIndex: number;
  stages: Stage[];
  rtl: boolean;
}) {
  const stage = stages[activeIndex];
  const meta = STAGE_META[activeIndex];
  if (!stage || !meta) return null;

  const fromRight = meta.side === 'right';
  // XOR: flex-start/end is flipped by dir="rtl", so we invert when RTL so the
  // panel always lands on the SAME side as the node (right node → right panel).
  const panelOnRight = fromRight !== rtl;

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, x: panelOnRight ? 48 : -48, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: panelOnRight ? 24 : -24 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className='pointer-events-none absolute bottom-8 left-0 right-0 z-20 flex px-8'
        style={{ justifyContent: panelOnRight ? 'flex-end' : 'flex-start' }}
        dir={rtl ? 'rtl' : 'ltr'}
      >
        <div className='w-[min(500px,calc(100vw-64px))]'>
          <span
            className='block mb-3'
            style={{
              fontSize: '10px',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#00a8f1',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {stage.number} / 0{stages.length}
          </span>
          <h3
            className='font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1e2364] mb-3'
            style={{ fontSize: 'clamp(22px, 2.6vw, 38px)' }}
          >
            {stage.title}
          </h3>
          <p
            className='text-[#6b7196] leading-relaxed'
            style={{ fontSize: 'clamp(13px, 1.1vw, 16px)' }}
          >
            {stage.description}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Mobile view — vertical timeline ─────────────────────────────────────────
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
      {/* Background ellipses */}
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

      {/* Header */}
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

      {/* Steps */}
      <div className='relative mx-auto max-w-lg'>
        {/* Vertical connector line */}
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
      {/* Node */}
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

      {/* Content */}
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

// ─── Main component ───────────────────────────────────────────────────────────
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
  const [activeIndex, setActiveIndex] = useState(-1);

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

      if (pathLength < 9999) {
        const len = pathRef.current.getTotalLength();
        const pt = pathRef.current.getPointAtLength(len * progress);
        setLeadingPoint({ x: pt.x, y: pt.y });
      }

      let idx = -1;
      for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
        if (progress >= STAGE_THRESHOLDS[i]) {
          idx = i;
          break;
        }
      }
      setActiveIndex(idx);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathLength, scrollMV]);

  const dashOffset = pathLength * (1 - scrollProgress);

  // Finale label cards (SVG foreignObject positions)
  const CARDS = [
    {
      foX: 1370,
      foY: 2,
      foW: 800,
      foH: 170,
      lx1: 2100,
      ly1: 174,
      lx2: 2100,
      ly2: 208,
    },
    {
      foX: 42,
      foY: 262,
      foW: 800,
      foH: 155,
      lx1: 100,
      ly1: 419,
      lx2: 100,
      ly2: 438,
    },
    {
      foX: 1370,
      foY: 472,
      foW: 800,
      foH: 160,
      lx1: 2100,
      ly1: 634,
      lx2: 2100,
      ly2: 648,
    },
    {
      foX: 42,
      foY: 655,
      foW: 800,
      foH: 158,
      lx1: 100,
      ly1: 815,
      lx2: 100,
      ly2: 833,
    },
    {
      // Stage 5 — center node (1100,970): card right side; diagonal leader from node up-right to card
      foX: 1370,
      foY: 720,
      foW: 800,
      foH: 140,
      lx1: 1100,
      ly1: 948,
      lx2: 1370,
      ly2: 862,
    },
  ];

  return (
    <>
      {/* ── Mobile view (< lg) ── */}
      <div className='lg:hidden relative overflow-hidden'>
        <MobileJourney
          eyebrow={eyebrow}
          title={title}
          stages={stages}
          rtl={rtl}
        />
      </div>

      {/* ── Desktop view (≥ lg) ── */}
      <div
        ref={sectionRef}
        className='relative hidden lg:block'
        style={{ height: SECTION_HEIGHT }}
        aria-label={title}
      >
        <div className='sticky top-0 z-[201] h-dvh flex flex-col overflow-hidden bg-[#f4f4f6]'>
          {/* Concentric-ellipse background */}
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

          {/* Section header */}
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

          {/* SVG canvas */}
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
                <linearGradient id='mjGlow' x1='0%' y1='0%' x2='0%' y2='100%'>
                  <stop offset='0%' stopColor='#1e2364' stopOpacity='0.4' />
                  <stop offset='100%' stopColor='#00a8f1' stopOpacity='0.4' />
                </linearGradient>
                <filter
                  id='mjPathBlur'
                  x='-25%'
                  y='-5%'
                  width='150%'
                  height='110%'
                >
                  <feGaussianBlur stdDeviation='6' result='blur' />
                  <feComposite in='SourceGraphic' in2='blur' operator='over' />
                </filter>
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


              {/* Glow layer */}
              <path
                d={PATH_D}
                fill='none'
                stroke='url(#mjGlow)'
                strokeWidth='14'
                strokeLinecap='round'
                filter='url(#mjPathBlur)'
                style={{
                  strokeDasharray: pathLength,
                  strokeDashoffset: dashOffset,
                  opacity: 0.22,
                }}
              />

              {/* Animated draw path */}
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

              {/* Travelling dot */}
              {scrollProgress > 0.005 && scrollProgress < 0.998 && (
                <circle
                  cx={leadingPoint.x}
                  cy={leadingPoint.y}
                  r={6}
                  fill='#00a8f1'
                  filter='url(#mjDotGlw)'
                />
              )}

              {/* Stage nodes */}
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

              {/* Finale labels */}
              {stages.map((stage, i) => {
                const isFinale = scrollProgress >= FINALE_THRESHOLD;
                const c = CARDS[i]!;
                return (
                  <motion.g
                    key={`finale-label-${i}`}
                    initial={false}
                    animate={{ opacity: isFinale ? 1 : 0 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: isFinale ? 0.2 + i * 0.14 : 0,
                    }}
                  >
                    <line
                      x1={c.lx1}
                      y1={c.ly1}
                      x2={c.lx2}
                      y2={c.ly2}
                      stroke='rgba(0,168,241,0.35)'
                      strokeWidth='1'
                      strokeDasharray='3 4'
                    />
                    <foreignObject
                      x={c.foX}
                      y={c.foY}
                      width={c.foW}
                      height={c.foH}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          textAlign: rtl ? 'right' : 'left',
                          direction: rtl ? 'rtl' : 'ltr',
                          padding: '0 20px',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            fontSize: '10px',
                            letterSpacing: '0.32em',
                            textTransform: 'uppercase',
                            color: '#00a8f1',
                            fontFamily: 'ui-monospace, monospace',
                            marginBottom: '6px',
                          }}
                        >
                          {stage.number}
                        </span>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '19px',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.2,
                            color: '#1e2364',
                            marginBottom: '6px',
                          }}
                        >
                          {stage.title}
                        </span>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
                            lineHeight: 1.6,
                            color: '#6b7196',
                          }}
                        >
                          {stage.description}
                        </span>
                      </div>
                    </foreignObject>
                  </motion.g>
                );
              })}
            </motion.svg>

            {scrollProgress < FINALE_THRESHOLD && (
              <StoryPanel activeIndex={activeIndex} stages={stages} rtl={rtl} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
