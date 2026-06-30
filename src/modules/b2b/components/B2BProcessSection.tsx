'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Locale } from '@/i18n/config';
import { isRtl } from '@/i18n/config';
import { cn } from '@/shared/lib/cn';

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

const RING_R = 22;

const MOBILE_CAM_W = 720;
const MOBILE_CAM_H = 640;
const MOBILE_PATH_END = 1;
const MOBILE_CAM_Y_FOCUS_START = 0.14;
const MOBILE_CAM_Y_FOCUS_END = 0.82;
const MOBILE_CARD_RESERVE = 'clamp(148px, 27vh, 196px)';
const MOBILE_STAGE_STEP = (MOBILE_PATH_END - STAGE_INTRO) / 5;
const MOBILE_STAGE_THRESHOLDS = [
  STAGE_INTRO,
  STAGE_INTRO + MOBILE_STAGE_STEP,
  STAGE_INTRO + MOBILE_STAGE_STEP * 2,
  STAGE_INTRO + MOBILE_STAGE_STEP * 3,
  STAGE_INTRO + MOBILE_STAGE_STEP * 4,
] as const;

type LayoutConfig = {
  labelW: number;
  labelH: number;
  labelGap: number;
  finaleLabelW: number;
  finaleLabelH: number;
  finaleLabelGap: number;
  finaleLabelGapLast: number;
  sectionHeight: string;
  camW: number[];
  camH: number[];
  camFinaleX: number;
};

const DESKTOP_FINALE_CAM_W = 4200;
const DESKTOP_FINALE_CAM_X = -1000;
const DESKTOP_FINALE_CAM_Y = -52;
const DESKTOP_FINALE_CAM_H = 1020;

const DESKTOP_LAYOUT: LayoutConfig = {
  labelW: 460,
  labelH: 176,
  labelGap: 130,
  finaleLabelW: 640,
  finaleLabelH: 312,
  finaleLabelGap: 88,
  finaleLabelGapLast: 140,
  sectionHeight: '2600vh',
  camW: [1200, 1200, 1200, 1200, 1200, 1200, DESKTOP_FINALE_CAM_W],
  camH: [1000, 600, 600, 600, 600, 600, DESKTOP_FINALE_CAM_H],
  camFinaleX: DESKTOP_FINALE_CAM_X,
};

const MOBILE_LAYOUT: LayoutConfig = {
  labelW: 300,
  labelH: 140,
  labelGap: 48,
  finaleLabelW: 280,
  finaleLabelH: 120,
  finaleLabelGap: 28,
  finaleLabelGapLast: 40,
  sectionHeight: '1600vh',
  camW: Array(7).fill(MOBILE_CAM_W) as number[],
  camH: Array(7).fill(MOBILE_CAM_H) as number[],
  camFinaleX: 380,
};

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

const ELLIPSE_BG = `url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 700' fill='none' stroke='%23d3d6e1' stroke-width='1'%3E%3Cellipse cx='800' cy='720' rx='220' ry='90'/%3E%3Cellipse cx='800' cy='720' rx='320' ry='130'/%3E%3Cellipse cx='800' cy='720' rx='430' ry='170'/%3E%3Cellipse cx='800' cy='720' rx='550' ry='215'/%3E%3Cellipse cx='800' cy='720' rx='680' ry='265'/%3E%3Cellipse cx='800' cy='720' rx='820' ry='320'/%3E%3Cellipse cx='800' cy='720' rx='970' ry='380'/%3E%3C/svg%3E")`;

function lerp(
  progress: number,
  input: readonly number[],
  output: readonly number[]
) {
  if (progress <= input[0]!) return output[0]!;
  if (progress >= input[input.length - 1]!) return output[output.length - 1]!;

  for (let i = 0; i < input.length - 1; i++) {
    const start = input[i]!;
    const end = input[i + 1]!;
    if (progress <= end) {
      const t = (progress - start) / (end - start);
      return output[i]! + (output[i + 1]! - output[i]!) * t;
    }
  }

  return output[output.length - 1]!;
}

function getLayout(compact: boolean): LayoutConfig {
  return compact ? MOBILE_LAYOUT : DESKTOP_LAYOUT;
}

function mapScrollToPathProgress(scroll: number, compact: boolean): number {
  const end = compact ? MOBILE_PATH_END : FINALE_THRESHOLD;
  const thresholds = compact ? MOBILE_STAGE_THRESHOLDS : STAGE_THRESHOLDS;

  if (scroll <= STAGE_INTRO) return 0;
  if (scroll >= end) return 1;

  for (let i = 0; i < 5; i++) {
    const legStart = thresholds[i]!;
    const legEnd = i < 4 ? thresholds[i + 1]! : end;
    if (scroll <= legEnd) {
      const t = (scroll - legStart) / (legEnd - legStart);
      return i * 0.2 + t * 0.2;
    }
  }

  return 1;
}

function getActiveLabelIndex(
  scrollProgress: number,
  pathProgress: number,
  compact: boolean
): number {
  if (!compact && scrollProgress >= FINALE_THRESHOLD) return -1;
  if (pathProgress <= 0) return -1;
  if (pathProgress <= 0.2) return 0;
  if (pathProgress <= 0.4) return 1;
  if (pathProgress <= 0.6) return 2;
  if (pathProgress <= 0.8) return 3;
  return 4;
}

function getStageState(
  progress: number,
  index: number,
  compact: boolean
): 'upcoming' | 'active' | 'completed' {
  const thresholds = compact ? MOBILE_STAGE_THRESHOLDS : STAGE_THRESHOLDS;
  const threshold = thresholds[index];
  const next = thresholds[index + 1];
  if (progress < threshold) return 'upcoming';
  if (next !== undefined && progress >= next) return 'completed';
  return 'active';
}

function getStageLabelLayout(index: number, layout: LayoutConfig): LabelLayout {
  const meta = STAGE_META[index]!;
  const foY = meta.nodeY - layout.labelH / 2;

  if (index === 4) {
    const foX = meta.nodeX + RING_R + layout.labelGap;
    return {
      foX,
      foY,
      foW: layout.labelW,
      foH: layout.labelH,
      lx1: meta.nodeX + RING_R,
      ly1: meta.nodeY,
      lx2: foX,
      ly2: meta.nodeY,
    };
  }

  if (meta.side === 'right') {
    const foX = meta.nodeX - layout.labelGap - layout.labelW;
    return {
      foX,
      foY,
      foW: layout.labelW,
      foH: layout.labelH,
      lx1: meta.nodeX - RING_R,
      ly1: meta.nodeY,
      lx2: foX + layout.labelW,
      ly2: meta.nodeY,
    };
  }

  const foX = meta.nodeX + RING_R + layout.labelGap;
  return {
    foX,
    foY,
    foW: layout.labelW,
    foH: layout.labelH,
    lx1: meta.nodeX + RING_R,
    ly1: meta.nodeY,
    lx2: foX,
    ly2: meta.nodeY,
  };
}

function getFinaleLabelLayout(
  index: number,
  layout: LayoutConfig
): LabelLayout {
  const meta = STAGE_META[index]!;
  const w = layout.finaleLabelW;
  const h = layout.finaleLabelH;
  const gap = index === 4 ? layout.finaleLabelGapLast : layout.finaleLabelGap;

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
      foY: meta.nodeY - h / 2,
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
    foY: meta.nodeY - h / 2,
    foW: w,
    foH: h,
    lx1: meta.nodeX - RING_R,
    ly1: meta.nodeY,
    lx2: foX + w,
    ly2: meta.nodeY,
    padTowardNode: 'end',
  };
}

function getMobileViewBox(
  leadingPoint: { x: number; y: number },
  pathProgress: number
): string {
  const yFocus = lerp(
    pathProgress,
    [0, 1],
    [MOBILE_CAM_Y_FOCUS_START, MOBILE_CAM_Y_FOCUS_END]
  );
  const x = leadingPoint.x - MOBILE_CAM_W / 2;
  const y = leadingPoint.y - MOBILE_CAM_H * yFocus;
  return `${x} ${y} ${MOBILE_CAM_W} ${MOBILE_CAM_H}`;
}

function getMobilePreserveAspectRatio(pathProgress: number): string {
  if (pathProgress <= 0.12) return 'xMidYMin meet';
  if (pathProgress >= 0.88) return 'xMidYMax meet';
  return 'xMidYMid meet';
}

function getDesktopViewBox(progress: number, layout: LayoutConfig): string {
  const camXValues = [
    CAM_INTRO.x,
    ...NODE_CAMERAS.map((c) => c.x),
    layout.camFinaleX,
  ];
  const camYValues = [
    CAM_INTRO.y,
    ...NODE_CAMERAS.map((c) => c.y),
    DESKTOP_FINALE_CAM_Y,
  ];

  const x = lerp(progress, CAM_PROGRESS, camXValues);
  const y = lerp(progress, CAM_PROGRESS, camYValues);
  const w = lerp(progress, CAM_PROGRESS, layout.camW);
  const h = lerp(progress, CAM_PROGRESS, layout.camH);

  return `${x} ${y} ${w} ${h}`;
}

function MobileStageCard({ stage, rtl }: { stage: Stage; rtl: boolean }) {
  return (
    <div
      className='rounded-[18px] border-2 border-[#e5e7f0] bg-white/95 p-4 shadow-[0_12px_40px_-24px_rgba(30,35,100,0.35)] backdrop-blur-sm'
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <h3 className='text-lg font-extrabold tracking-[-0.4px] text-[#1e2364]'>
        {stage.title}
      </h3>
      <p className='mt-1 text-sm leading-relaxed text-[#6b7196]'>
        {stage.description}
      </p>
    </div>
  );
}

function StageLabelContent({
  stage,
  total,
  rtl,
  size = 'active',
  compact,
  padTowardNode,
}: {
  stage: Stage;
  total: number;
  rtl: boolean;
  size?: 'active' | 'finale';
  compact: boolean;
  padTowardNode?: 'start' | 'end';
}) {
  const isFinale = size === 'finale';
  const padInner = compact ? 14 : 20;
  const padOuter = compact ? 12 : 20;
  const padBlock = isFinale ? (compact ? 8 : 12) : 0;

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

  const numberSize = isFinale
    ? compact
      ? '11px'
      : '22px'
    : compact
      ? '9px'
      : '10px';
  const titleSize = isFinale
    ? compact
      ? '22px'
      : '56px'
    : compact
      ? '18px'
      : '26px';
  const descSize = isFinale
    ? compact
      ? '13px'
      : '27px'
    : compact
      ? '12px'
      : '14px';

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
          fontSize: numberSize,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#00a8f1',
          fontFamily: 'ui-monospace, monospace',
          marginBottom: isFinale ? '8px' : '6px',
        }}
      >
        {stage.number} / 0{total}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: titleSize,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          color: '#1e2364',
          marginBottom: isFinale ? '8px' : '6px',
        }}
      >
        {stage.title}
      </span>
      <span
        style={{
          display: 'block',
          fontSize: descSize,
          lineHeight: 1.55,
          color: '#6b7196',
        }}
      >
        {stage.description}
      </span>
    </div>
  );
}

interface Props {
  locale: Locale;
}

export function B2BProcessSection({ locale }: Props) {
  const rtl = isRtl(locale);
  const content = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.en;
  const { eyebrow, title, stages } = content;

  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [compact, setCompact] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [leadingPoint, setLeadingPoint] = useState({ x: 1100, y: 40 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const layout = getLayout(compact);

  const measurePath = useCallback(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  useLayoutEffect(() => {
    measurePath();
  }, [measurePath, compact]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      if (!sectionRef.current || !pathRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollable = Math.max(sectionHeight - viewportHeight, 1);
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / scrollable);

      setScrollProgress(progress);

      if (pathLength > 0) {
        const pathProgress = mapScrollToPathProgress(progress, compact);
        const point = pathRef.current.getPointAtLength(
          pathLength * pathProgress
        );
        setLeadingPoint({ x: point.x, y: point.y });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathLength, compact]);

  const pathProgress = mapScrollToPathProgress(scrollProgress, compact);
  const dashOffset = pathLength > 0 ? pathLength * (1 - pathProgress) : 0;
  const activeLabelIndex = getActiveLabelIndex(
    scrollProgress,
    pathProgress,
    compact
  );
  const viewBox = compact
    ? getMobileViewBox(leadingPoint, pathProgress)
    : getDesktopViewBox(scrollProgress, layout);
  const mobileAspect = getMobilePreserveAspectRatio(pathProgress);
  const isFinale = !compact && scrollProgress >= FINALE_THRESHOLD;
  const ringR = compact ? 18 : RING_R;

  return (
    <section
      ref={sectionRef}
      className='relative bg-[#f4f4f6]'
      style={{ height: layout.sectionHeight }}
      aria-label={title}
    >
      <div className='sticky top-0 z-[201] flex h-dvh flex-col overflow-hidden bg-[#f4f4f6]'>
        <div
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute inset-0',
            compact ? 'opacity-[0.32]' : 'opacity-[0.42]'
          )}
          style={{
            backgroundImage: ELLIPSE_BG,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center 75%',
            backgroundSize: compact ? '140% auto' : '1700px auto',
          }}
        />

        <div
          className={cn(
            'relative z-10 shrink-0',
            compact
              ? 'px-4 pt-4 pb-0 sm:px-6'
              : 'flex flex-col items-center px-4 pt-10 pb-3 sm:px-7'
          )}
        >
          {compact ? (
            <div className='mx-auto w-full max-w-lg'>
              <div className='mb-1.5'>
                <span className='font-mono text-[13px] font-medium uppercase tracking-[0.28em] text-[#1e2364]/40 sm:text-[15px] min-[1920px]:text-[17px]'>
                  {eyebrow}
                </span>
              </div>
              <h2 className='text-[clamp(24px,5.5vw,34px)] font-extrabold leading-none tracking-[-1px] text-[#1e2364]'>
                {title}
              </h2>
            </div>
          ) : (
            <>
              <div className='mb-3'>
                <span className='font-mono text-[13px] font-medium uppercase tracking-[0.28em] text-[#1e2364]/40 sm:text-[15px] min-[1920px]:text-[17px]'>
                  {eyebrow}
                </span>
              </div>
              <h2 className='text-center text-[clamp(28px,3.5vw,52px)] font-extrabold leading-none tracking-[-1px] text-[#1e2364] min-[1920px]:text-[clamp(44px,2.8vw,60px)]'>
                {title}
              </h2>
            </>
          )}
        </div>

        <div className='relative z-0 min-h-0 flex-1 overflow-hidden'>
          {compact && activeLabelIndex >= 0 && (
            <div className='absolute inset-x-0 bottom-0 z-30 px-4 pb-4 pt-1'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeLabelIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <MobileStageCard
                    stage={stages[activeLabelIndex]!}
                    rtl={rtl}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          <div
            className='absolute inset-x-0 top-0'
            style={compact ? { bottom: MOBILE_CARD_RESERVE } : { bottom: 0 }}
          >
            <svg
              viewBox={viewBox}
              className='h-full w-full'
              preserveAspectRatio={
                compact
                  ? mobileAspect
                  : isFinale
                    ? 'xMidYMin meet'
                    : 'xMidYMid meet'
              }
              aria-hidden='true'
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
                strokeWidth={compact ? 2 : 2.4}
                strokeLinecap='round'
                strokeDasharray={pathLength || undefined}
                strokeDashoffset={dashOffset}
              />

              {pathLength > 0 &&
                scrollProgress > 0.005 &&
                scrollProgress < 0.998 && (
                  <circle
                    cx={leadingPoint.x}
                    cy={leadingPoint.y}
                    r={compact ? 5 : 6}
                    fill='#00a8f1'
                    filter='url(#mjDotGlw)'
                  />
                )}

              {stages.map((stage, i) => {
                const meta = STAGE_META[i]!;
                const state = getStageState(scrollProgress, i, compact);
                const isActive = state === 'active';
                const isCompleted = state === 'completed';
                const nodeAlpha = isFinale
                  ? 1
                  : isActive
                    ? 1
                    : isCompleted
                      ? compact
                        ? 0.55
                        : 0.38
                      : compact
                        ? 0.2
                        : 0;

                return (
                  <g key={stage.number}>
                    <motion.circle
                      cx={meta.nodeX}
                      cy={meta.nodeY}
                      r={ringR + 8}
                      fill='none'
                      stroke='#00a8f1'
                      strokeWidth='1'
                      animate={
                        isActive
                          ? {
                              r: [ringR + 4, ringR + 34],
                              opacity: [0.55, 0],
                            }
                          : { opacity: 0, r: ringR + 4 }
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
                      r={ringR + 8}
                      fill='none'
                      stroke='#00a8f1'
                      strokeWidth='0.6'
                      animate={
                        isActive
                          ? {
                              r: [ringR + 2, ringR + 50],
                              opacity: [0.35, 0],
                            }
                          : { opacity: 0, r: ringR + 2 }
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
                      r={ringR}
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
                      r={isActive ? (compact ? 9 : 10) : compact ? 4 : 5}
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
                          'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    />
                  </g>
                );
              })}

              {!compact &&
                scrollProgress < FINALE_THRESHOLD &&
                activeLabelIndex >= 0 && (
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
                        const labelLayout = getStageLabelLayout(
                          activeLabelIndex,
                          layout
                        );
                        const stage = stages[activeLabelIndex]!;
                        return (
                          <>
                            <line
                              x1={labelLayout.lx1}
                              y1={labelLayout.ly1}
                              x2={labelLayout.lx2}
                              y2={labelLayout.ly2}
                              stroke='rgba(0,168,241,0.45)'
                              strokeWidth='1'
                            />
                            <foreignObject
                              x={labelLayout.foX}
                              y={labelLayout.foY}
                              width={labelLayout.foW}
                              height={labelLayout.foH}
                            >
                              <StageLabelContent
                                stage={stage}
                                total={stages.length}
                                rtl={rtl}
                                compact={compact}
                              />
                            </foreignObject>
                          </>
                        );
                      })()}
                    </motion.g>
                  </AnimatePresence>
                )}

              {!compact &&
                stages.map((stage, i) => {
                  const labelLayout = getFinaleLabelLayout(i, layout);
                  return (
                    <motion.g
                      key={`finale-${stage.number}`}
                      initial={false}
                      animate={{ opacity: isFinale ? 1 : 0 }}
                      transition={{
                        duration: 0.6,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: isFinale ? 0.08 + i * 0.07 : 0,
                      }}
                      style={{ pointerEvents: isFinale ? 'auto' : 'none' }}
                    >
                      <line
                        x1={labelLayout.lx1}
                        y1={labelLayout.ly1}
                        x2={labelLayout.lx2}
                        y2={labelLayout.ly2}
                        stroke='rgba(0,168,241,0.35)'
                        strokeWidth='1'
                        strokeDasharray='3 4'
                      />
                      <foreignObject
                        x={labelLayout.foX}
                        y={labelLayout.foY}
                        width={labelLayout.foW}
                        height={labelLayout.foH}
                      >
                        <StageLabelContent
                          stage={stage}
                          total={stages.length}
                          rtl={rtl}
                          compact={compact}
                          size='finale'
                          padTowardNode={labelLayout.padTowardNode}
                        />
                      </foreignObject>
                    </motion.g>
                  );
                })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
