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
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';

interface Stage {
  number: string;
  title: string;
  description: string;
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)] ?? d);
}

const SECTION_META: Record<string, { eyebrow: string; title: string }> = {
  en: { eyebrow: 'How it works', title: 'The Mwafq Journey' },
  ar: { eyebrow: 'كيف يعمل', title: 'رحلة موفق' },
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

/** Fallback path fractions until the SVG path is measured. */
const NODE_PATH_PROGRESS = [0.2, 0.4, 0.6, 0.8, 1.0] as const;
/** Hide label/ring until this far through the leg toward a node (0–1). */
const NODE_ARRIVE_RATIO = 0.82;
/** Keep visible this far into the leg toward the next node (0–1). */
const NODE_DWELL_RATIO = 0.38;

function measureNodePathProgress(path: SVGPathElement): number[] {
  const len = path.getTotalLength();
  if (len <= 0) return [...NODE_PATH_PROGRESS];

  return STAGE_META.map((meta) => {
    let bestT = 0;
    let bestD = Infinity;
    const steps = 240;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = path.getPointAtLength(len * t);
      const d = (point.x - meta.nodeX) ** 2 + (point.y - meta.nodeY) ** 2;
      if (d < bestD) {
        bestD = d;
        bestT = t;
      }
    }

    return bestT;
  });
}

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

// Frame = tight bounds of the finale content (all nodes + labels), so the
// graphic is as large as possible and `meet` fills the height instead of
// shrinking to fit a too-wide frame. Centered on the content box (1110, 600).
const DESKTOP_FINALE_CAM_W = 3520;
const DESKTOP_FINALE_CAM_X = -650;
const DESKTOP_FINALE_CAM_Y = 50;
const DESKTOP_FINALE_CAM_H = 1100;

const DESKTOP_LAYOUT: LayoutConfig = {
  labelW: 460,
  labelH: 176,
  labelGap: 130,
  finaleLabelW: 640,
  finaleLabelH: 312,
  finaleLabelGap: 88,
  finaleLabelGapLast: 140,
  sectionHeight: '500vh', // was 800vh — noticeably faster
  camW: [1200, 1200, 1200, 1200, 1200, 1200, DESKTOP_FINALE_CAM_W],
  camH: [1000, 600, 600, 600, 600, 600, DESKTOP_FINALE_CAM_H],
  camFinaleX: DESKTOP_FINALE_CAM_X,
};

const MOBILE_LAYOUT: LayoutConfig = {
  labelW: 400,
  labelH: 150,
  labelGap: 30,
  finaleLabelW: 280,
  finaleLabelH: 120,
  finaleLabelGap: 28,
  finaleLabelGapLast: 40,
  sectionHeight: '350vh', // was 500vh — noticeably faster
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

function mapScrollToPathProgress(
  scroll: number,
  compact: boolean,
  nodes: readonly number[]
): number {
  const end = compact ? MOBILE_PATH_END : FINALE_THRESHOLD;
  const thresholds = compact ? MOBILE_STAGE_THRESHOLDS : STAGE_THRESHOLDS;
  const lastNode = nodes[nodes.length - 1] ?? 1;

  if (scroll <= STAGE_INTRO) return 0;
  if (scroll >= end) return lastNode;

  for (let i = 0; i < nodes.length; i++) {
    const legStart = thresholds[i]!;
    const legEnd = i < nodes.length - 1 ? thresholds[i + 1]! : end;
    if (scroll <= legEnd) {
      const t = (scroll - legStart) / (legEnd - legStart);
      const pathStart = i === 0 ? 0 : nodes[i - 1]!;
      const pathEnd = nodes[i]!;
      return pathStart + t * (pathEnd - pathStart);
    }
  }

  return lastNode;
}

function nodeVisibilityWindow(index: number, nodes: readonly number[]) {
  const nodeAt = nodes[index]!;
  const pathStart = index === 0 ? 0 : nodes[index - 1]!;
  const pathEnd = index < nodes.length - 1 ? nodes[index + 1]! : 1;

  const showFrom = pathStart + (nodeAt - pathStart) * NODE_ARRIVE_RATIO;

  if (index === nodes.length - 1) {
    return { showFrom, showUntil: 1 };
  }

  const showUntil = nodeAt + (pathEnd - nodeAt) * NODE_DWELL_RATIO;
  return { showFrom, showUntil };
}

function getActiveLabelIndex(
  scrollProgress: number,
  pathProgress: number,
  compact: boolean,
  nodes: readonly number[]
): number {
  if (!compact && scrollProgress >= FINALE_THRESHOLD) return -1;
  if (pathProgress <= 0) return -1;

  for (let i = nodes.length - 1; i >= 0; i--) {
    const { showFrom, showUntil } = nodeVisibilityWindow(i, nodes);
    if (pathProgress >= showFrom && pathProgress <= showUntil) return i;
  }

  return -1;
}

function getStageState(
  pathProgress: number,
  index: number,
  nodes: readonly number[]
): 'upcoming' | 'active' | 'completed' {
  const { showFrom, showUntil } = nodeVisibilityWindow(index, nodes);
  if (pathProgress < showFrom) return 'upcoming';
  if (pathProgress > showUntil) return 'completed';
  return 'active';
}

function getStageLabelLayout(
  index: number,
  layout: LayoutConfig,
  compact = false
): LabelLayout {
  const meta = STAGE_META[index]!;
  const foY = meta.nodeY - layout.labelH / 2;

  // Last node sits horizontally centered (nodeX 1100). On mobile a side-mounted
  // card gets crammed against the frame edge, so stack it ABOVE the node,
  // centered, with a short vertical connector — balanced, clear focal point.
  if (index === 4 && compact) {
    const foX = meta.nodeX - layout.labelW / 2;
    const foYAbove = meta.nodeY - RING_R - layout.labelGap - layout.labelH;
    return {
      foX,
      foY: foYAbove,
      foW: layout.labelW,
      foH: layout.labelH,
      lx1: meta.nodeX,
      ly1: meta.nodeY - RING_R,
      lx2: meta.nodeX,
      ly2: foYAbove + layout.labelH,
    };
  }

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

// Camera vertical focus is a single continuous lerp over the whole journey.
// No per-card snapping and no preserveAspectRatio switching — any discontinuity
// here reads as the screen lurching on mobile (worst around point 4).
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
  const showMobileCard = compact && !isFinale;
  const padInner = compact ? 14 : 20;
  const padOuter = compact ? 12 : 20;
  const padBlock = isFinale ? (compact ? 8 : 12) : 0;

  const paddingStyle = showMobileCard
    ? { padding: '10px 18px' }
    : isFinale && padTowardNode
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
      ? '11px'
      : '10px';
  const titleSize = isFinale
    ? compact
      ? '22px'
      : '56px'
    : compact
      ? '24px'
      : '26px';
  const descSize = isFinale
    ? compact
      ? '13px'
      : '27px'
    : compact
      ? '15px'
      : '14px';

  const content = (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: showMobileCard ? '100%' : undefined,
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
        {stage.number} / {rtl ? toArabicDigits(`0${total}`) : `0${total}`}
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
          ...(showMobileCard ? { wordBreak: 'break-word' } : {}),
        }}
      >
        {stage.description}
      </span>
    </div>
  );

  if (!showMobileCard) return content;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.55)', // was 0.35 — enough opacity alone to occlude the line immediately
        backdropFilter: 'blur(16px) saturate(160%)', // blur is now a bonus effect, not doing the hiding
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        boxShadow: '0 12px 40px -24px rgba(30,35,100,0.35)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {content}
    </div>
  );
}

function MobileJourneyTimeline({
  stages,
  rtl,
  eyebrow,
  title,
}: {
  stages: Stage[];
  rtl: boolean;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className='relative bg-[#f4f4f6] px-5 py-14 max-[560px]:px-4'>
      <div className='mx-auto mb-10 max-w-lg text-center'>
        <span className='font-mono text-[12px] font-medium uppercase tracking-[0.28em] text-[#1e2364]/40'>
          {eyebrow}
        </span>
        <h2 className='mt-2 text-[clamp(26px,6.5vw,34px)] font-extrabold leading-[1.05] tracking-[-0.8px] text-[#1e2364]'>
          {title}
        </h2>
      </div>

      <ol className='relative mx-auto flex max-w-lg flex-col gap-6'>
        <span
          aria-hidden='true'
          className='absolute top-2 bottom-2 start-[19px] w-px bg-gradient-to-b from-[#1e2364] to-[#00a8f1]'
        />

        {stages.map((stage, index) => (
          <ScrollReveal
            key={stage.number}
            variant='y'
            transitionDelay={Math.min(index, 3) * 0.05}
          >
            <li className='relative flex min-h-[104px] gap-4'>
              <span
                className='relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#00a8f1] bg-[#f4f4f6] font-mono text-[13px] font-bold text-[#00a8f1]'
                aria-hidden='true'
              >
                {stage.number}
              </span>

              <div className='min-w-0 flex-1 pt-1.5'>
                <h3 className='mb-1.5 text-[18px] font-extrabold leading-[1.2] tracking-[-0.4px] text-[#1e2364]'>
                  {stage.title}
                </h3>
                <p className='text-[13px] leading-[1.55] text-[#6b7196]'>
                  {stage.description}
                </p>
              </div>
            </li>
          </ScrollReveal>
        ))}
      </ol>
    </section>
  );
}

interface Props {
  locale: Locale;
  stages: Stage[];
}

export function B2BProcessSection({ locale, stages: cmsStages }: Props) {
  const rtl = isRtl(locale);
  const meta = SECTION_META[locale] ?? SECTION_META.en!;
  const { eyebrow, title } = meta;
  const stages = cmsStages.map((stage) => ({
    ...stage,
    number: rtl ? toArabicDigits(stage.number) : stage.number,
  }));

  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (compact) {
    return (
      <MobileJourneyTimeline
        stages={stages}
        rtl={rtl}
        eyebrow={eyebrow}
        title={title}
      />
    );
  }

  return <B2BProcessSectionDesktop stages={cmsStages} rtl={rtl} />;
}

function B2BProcessSectionDesktop({
  stages: cmsStages,
  rtl,
}: {
  stages: Stage[];
  rtl: boolean;
}) {
  const meta = SECTION_META[rtl ? 'ar' : 'en']!;
  const { eyebrow, title } = meta;
  const stages = cmsStages.map((stage) => ({
    ...stage,
    number: rtl ? toArabicDigits(stage.number) : stage.number,
  }));
  const compact = false;

  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [pathLength, setPathLength] = useState(0);
  const [nodePathProgress, setNodePathProgress] = useState<number[]>([
    ...NODE_PATH_PROGRESS,
  ]);
  const [leadingPoint, setLeadingPoint] = useState({ x: 1100, y: 40 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const layout = getLayout(compact);

  const measurePath = useCallback(() => {
    const path = pathRef.current;
    if (!path) return;
    setPathLength(path.getTotalLength());
    setNodePathProgress(measureNodePathProgress(path));
  }, []);

  useLayoutEffect(() => {
    measurePath();
  }, [measurePath]);

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
        const pathProgress = mapScrollToPathProgress(
          progress,
          compact,
          nodePathProgress
        );
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
  }, [pathLength, compact, nodePathProgress]);

  const pathProgress = mapScrollToPathProgress(
    scrollProgress,
    compact,
    nodePathProgress
  );
  const dashOffset = pathLength > 0 ? pathLength * (1 - pathProgress) : 0;
  const activeLabelIndex = getActiveLabelIndex(
    scrollProgress,
    pathProgress,
    compact,
    nodePathProgress
  );
  const lastNodeShowFrom = nodeVisibilityWindow(
    stages.length - 1,
    nodePathProgress
  ).showFrom;
  const mobilePinLast = compact && pathProgress >= lastNodeShowFrom;
  let lastReachedIndex = -1;
  for (let i = 0; i < nodePathProgress.length; i++) {
    if (pathProgress >= nodeVisibilityWindow(i, nodePathProgress).showFrom) {
      lastReachedIndex = i;
    }
  }
  const displayLabelIndex = mobilePinLast
    ? stages.length - 1
    : compact
      ? activeLabelIndex
      : lastReachedIndex;
  const viewBox = compact
    ? getMobileViewBox(leadingPoint, pathProgress)
    : getDesktopViewBox(scrollProgress, layout);
  const isFinale = !compact && scrollProgress >= FINALE_THRESHOLD;
  const ringR = compact ? 18 : RING_R;
  const showStageLabel = compact
    ? displayLabelIndex >= 0
    : scrollProgress < FINALE_THRESHOLD && displayLabelIndex >= 0;
  const showLeadingDot =
    pathLength > 0 &&
    scrollProgress > 0.005 &&
    (compact ? scrollProgress <= 1 : scrollProgress < 0.998);

  const getNodeState = (index: number) => {
    if (mobilePinLast) {
      return index === stages.length - 1 ? 'active' : 'completed';
    }
    return getStageState(pathProgress, index, nodePathProgress);
  };

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
              ? 'px-5 pb-2 pt-[52px] max-[560px]:pt-[36px] sm:px-6'
              : 'flex flex-col items-center px-4 pt-10 pb-3 sm:px-7'
          )}
        >
          {compact ? (
            <div className='mx-auto w-full max-w-lg text-center'>
              <div className='mb-2'>
                <span className='font-mono text-[12px] font-medium uppercase tracking-[0.28em] text-[#1e2364]/40 sm:text-[15px]'>
                  {eyebrow}
                </span>
              </div>
              <h2 className='text-[clamp(26px,6.5vw,34px)] font-extrabold leading-[1.05] tracking-[-0.8px] text-[#1e2364]'>
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
          <div
            className={cn(
              'absolute inset-0',
              !compact && 'px-[clamp(16px,4vw,96px)]'
            )}
          >
            <svg
              viewBox={viewBox}
              className='h-full w-full'
              preserveAspectRatio='xMidYMid meet'
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

              {showLeadingDot && (
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
                const state = getNodeState(i);
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

              {showStageLabel && (
                <AnimatePresence mode={compact ? 'wait' : 'sync'}>
                  <motion.g
                    key={displayLabelIndex}
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
                        displayLabelIndex,
                        layout,
                        compact
                      );
                      const stage = stages[displayLabelIndex]!;
                      return (
                        <>
                          <line
                            x1={labelLayout.lx1}
                            y1={labelLayout.ly1}
                            x2={labelLayout.lx2}
                            y2={labelLayout.ly2}
                            stroke='rgba(0,168,241,0.45)'
                            strokeWidth={compact ? 1.2 : 1}
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
