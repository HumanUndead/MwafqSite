'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Slider as SliderPrimitive } from '@base-ui/react/slider';
import {
  Gauge,
  Lock,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import type { Dictionary } from '@/locales/types';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { cn } from '@/shared/lib/cn';
import {
  getMaxWatched,
  getVideoProgress,
  saveMaxWatched,
  saveVideoProgress,
} from './videoProgress';
import {
  useContentProtection,
  type ProtectionThreat,
} from './useContentProtection';

interface VimeoEventData {
  seconds: number;
  duration?: number;
  volume?: number;
}

interface VimeoPlayer {
  on: (event: string, cb: (data: VimeoEventData) => void) => void;
  off: (event: string, cb?: (data: VimeoEventData) => void) => void;
  ready: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  getDuration: () => Promise<number>;
  getCurrentTime: () => Promise<number>;
  setCurrentTime: (seconds: number) => Promise<number>;
  setVolume: (volume: number) => Promise<number>;
  setPlaybackRate: (rate: number) => Promise<number>;
}

declare global {
  interface Window {
    Vimeo?: { Player: new (el: HTMLIFrameElement) => VimeoPlayer };
  }
}

const SDK_URL = 'https://player.vimeo.com/api/player.js';
/** Rewind / forward step for the buttons and arrow keys. */
const SKIP_SECONDS = 10;
/** Slack for timeupdate jitter before a jump counts as a skip. */
const SKIP_TOLERANCE = 2;
const SPEEDS = [1, 1.25, 1.5, 2, 0.75] as const;
const HIDE_CONTROLS_MS = 2500;

let sdkPromise: Promise<void> | null = null;

function loadVimeoSdk(): Promise<void> {
  if (typeof window !== 'undefined' && window.Vimeo) return Promise.resolve();
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        sdkPromise = null;
        reject(new Error('Vimeo SDK failed to load'));
      };
      document.body.appendChild(script);
    });
  }
  return sdkPromise;
}

/** Vimeo embed with its own chrome hidden: our controls drive the API. */
function chromelessEmbedUrl(embedUrl: string): string {
  try {
    const url = new URL(embedUrl);
    const params: Record<string, string> = {
      controls: '0',
      keyboard: '0',
      title: '0',
      byline: '0',
      portrait: '0',
      pip: '0',
      dnt: '1',
    };
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return embedUrl;
  }
}

function formatTime(total: number): string {
  const safe = Math.max(0, Math.floor(total || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = String(safe % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`;
}

const controlButton =
  'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none';

/**
 * Lecture video with custom controls. Until the lecture is completed the
 * learner may rewind freely but never move past the furthest point watched
 * (seek bar, skip buttons and keys are clamped, and any other jump is
 * snapped back). Once completed, every action is allowed.
 */
export function VimeoLecturePlayer({
  embedUrl,
  title,
  userCourseId,
  lectureId,
  allowSeek,
  onEnded,
  onUnavailable,
  labels,
}: {
  embedUrl: string;
  title: string;
  userCourseId: number;
  lectureId: number;
  /** The lecture is completed: free seeking and speed changes. */
  allowSeek: boolean;
  onEnded: () => void;
  /** The player API could not be driven (SDK blocked). */
  onUnavailable: () => void;
  labels: Dictionary['academyLecture']['player'];
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const maxWatchedRef = useRef(0);
  const allowSeekRef = useRef(allowSeek);
  const onEndedRef = useRef(onEnded);
  const onUnavailableRef = useRef(onUnavailable);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const [shield, setShield] = useState<ProtectionThreat | null>(null);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);
  const hydrated = useHydrated();
  const fullscreenSupported = hydrated && Boolean(document.fullscreenEnabled);

  useEffect(() => {
    allowSeekRef.current = allowSeek;
    onEndedRef.current = onEnded;
    onUnavailableRef.current = onUnavailable;
  });

  const flashSkipHint = useCallback(() => {
    setShowSkipHint(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowSkipHint(false), 2200);
  }, []);

  /** Furthest point the learner may seek to right now. */
  const seekLimit = useCallback(
    (total: number) => (allowSeekRef.current ? total : maxWatchedRef.current),
    []
  );

  // Player lifecycle. The component is keyed per lecture by its parent; the
  // iframe is never destroyed here (see LecturePlayer's note on destroy()).
  useEffect(() => {
    let cancelled = false;
    let player: VimeoPlayer | null = null;
    maxWatchedRef.current = getMaxWatched(userCourseId, lectureId);

    const onTimeUpdate = (data: VimeoEventData) => {
      const seconds = data.seconds;
      if (!allowSeekRef.current && seconds > maxWatchedRef.current + SKIP_TOLERANCE) {
        void player?.setCurrentTime(maxWatchedRef.current);
        return;
      }
      if (seconds > maxWatchedRef.current) {
        maxWatchedRef.current = seconds;
        setMaxWatched(seconds);
        saveMaxWatched(userCourseId, lectureId, seconds);
      }
      setCurrent(seconds);
      if (data.duration) setDuration(data.duration);
      saveVideoProgress(userCourseId, lectureId, seconds);
    };
    const onSeeked = (data: VimeoEventData) => {
      if (!allowSeekRef.current && data.seconds > maxWatchedRef.current + SKIP_TOLERANCE) {
        void player?.setCurrentTime(maxWatchedRef.current);
        flashSkipHint();
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => {
      setPlaying(false);
      onEndedRef.current();
    };

    loadVimeoSdk()
      .then(async () => {
        if (cancelled || !iframeRef.current || !window.Vimeo) return;
        player = new window.Vimeo.Player(iframeRef.current);
        playerRef.current = player;
        player.on('timeupdate', onTimeUpdate);
        player.on('seeked', onSeeked);
        player.on('play', onPlay);
        player.on('pause', onPause);
        player.on('ended', onEnd);

        await player.ready();
        if (cancelled) return;
        const total = await player.getDuration();
        const saved = getVideoProgress(userCourseId, lectureId);
        const resumeAt = allowSeekRef.current
          ? saved
          : Math.min(saved, maxWatchedRef.current);
        if (resumeAt > 0 && resumeAt < total - 1) {
          await player.setCurrentTime(resumeAt);
          setCurrent(resumeAt);
        }
        setDuration(total);
        setMaxWatched(maxWatchedRef.current);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) onUnavailableRef.current();
      });

    return () => {
      cancelled = true;
      if (player) {
        player
          .getCurrentTime()
          .then((seconds) => saveVideoProgress(userCourseId, lectureId, seconds))
          .catch(() => {});
        player.off('timeupdate', onTimeUpdate);
        player.off('seeked', onSeeked);
        player.off('play', onPlay);
        player.off('pause', onPause);
        player.off('ended', onEnd);
      }
      playerRef.current = null;
    };
  }, [userCourseId, lectureId, flashSkipHint]);

  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(
      () => setControlsVisible(false),
      HIDE_CONTROLS_MS
    );
  }, []);

  // Screenshot / recording / inspect deterrents: pause and cover the video.
  useContentProtection({
    enabled: true,
    onThreat: (threat) => {
      void playerRef.current?.pause().catch(() => {});
      setShield(threat);
    },
    onDevtoolsChange: setDevtoolsOpen,
  });
  const covered = shield !== null || devtoolsOpen;

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !ready || covered) return;
    void (playing ? player.pause() : player.play()).catch(() => {});
    revealControls();
  }, [covered, playing, ready, revealControls]);

  /** Seek, clamped to the allowed range; flashes the hint when clamped. */
  const seekTo = useCallback(
    (target: number) => {
      const player = playerRef.current;
      if (!player || !ready) return;
      const limit = seekLimit(duration);
      const clamped = Math.max(0, Math.min(target, limit, duration));
      if (target > limit + 0.5) flashSkipHint();
      setCurrent(clamped);
      void player.setCurrentTime(clamped).catch(() => {});
      revealControls();
    },
    [duration, flashSkipHint, ready, revealControls, seekLimit]
  );

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const next = !muted;
    setMuted(next);
    void player.setVolume(next ? 0 : 1).catch(() => {});
  }, [muted]);

  const cycleSpeed = useCallback(() => {
    const player = playerRef.current;
    if (!player || !allowSeekRef.current) return;
    const index = SPEEDS.indexOf(speed as (typeof SPEEDS)[number]);
    const next = SPEEDS[(index + 1) % SPEEDS.length];
    setSpeed(next);
    void player.setPlaybackRate(next).catch(() => {});
  }, [speed]);

  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void wrapper.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') {
      event.preventDefault();
      togglePlay();
    } else if (key === 'arrowleft') {
      event.preventDefault();
      seekTo(current - SKIP_SECONDS);
    } else if (key === 'arrowright') {
      event.preventDefault();
      seekTo(current + SKIP_SECONDS);
    } else if (key === 'm') {
      toggleMute();
    } else if (key === 'f' && fullscreenSupported) {
      toggleFullscreen();
    }
  };

  const shownTime = dragValue ?? current;
  const limit = allowSeek ? duration : maxWatched;
  const watchedPct = duration > 0 ? Math.min(100, (maxWatched / duration) * 100) : 0;
  const canForward = ready && (allowSeek || current + 0.5 < maxWatched);
  const showControls = controlsVisible || !playing;

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      role='region'
      aria-label={title}
      onKeyDown={handleKeyDown}
      onMouseMove={revealControls}
      onFocus={revealControls}
      className={cn(
        'group/player relative aspect-video select-none overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] print:hidden',
        fullscreen && 'aspect-auto size-full',
        playing && !showControls && 'cursor-none'
      )}
    >
      <iframe
        ref={iframeRef}
        src={chromelessEmbedUrl(embedUrl)}
        allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media'
        referrerPolicy='strict-origin-when-cross-origin'
        className='pointer-events-none absolute inset-0 size-full'
        title={title}
        tabIndex={-1}
      />

      {/* Click layer: the Vimeo frame never receives input directly. */}
      <button
        type='button'
        tabIndex={-1}
        aria-hidden
        onClick={togglePlay}
        onDoubleClick={fullscreenSupported ? toggleFullscreen : undefined}
        className='absolute inset-0 size-full cursor-pointer'
      />

      {ready && !playing && (
        <button
          type='button'
          onClick={togglePlay}
          aria-label={labels.play}
          className='absolute inset-0 m-auto inline-flex size-16 cursor-pointer items-center justify-center rounded-full bg-[#00a8f1] text-white shadow-[0_12px_32px_-8px_rgba(0,168,241,0.7)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none motion-reduce:hover:scale-100 sm:size-20'
        >
          <Play className='ms-1 size-7 sm:size-9' aria-hidden />
        </button>
      )}

      {!ready && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <span className='size-10 animate-spin rounded-full border-4 border-white/20 border-t-[#00a8f1] motion-reduce:animate-none' />
        </div>
      )}

      {showSkipHint && (
        <div
          role='status'
          className='pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4'
        >
          <span className='inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur'>
            <Lock className='size-4 text-amber-400' aria-hidden />
            {labels.skipLocked}
          </span>
        </div>
      )}

      {/* Control bar: a timeline reads left to right in every language. */}
      <DirectionProvider direction='ltr'>
        <div
          dir='ltr'
          className={cn(
            'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 motion-reduce:transition-none sm:px-4 sm:pb-3',
            showControls ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        >
          <SliderPrimitive.Root
            aria-label={labels.seek}
            value={shownTime}
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            disabled={!ready}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              if (!allowSeek && next > limit + 0.5) flashSkipHint();
              setDragValue(Math.min(next, limit));
            }}
            onValueCommitted={(value) => {
              const next = Array.isArray(value) ? value[0] : value;
              setDragValue(null);
              seekTo(next);
            }}
            className='w-full'
          >
            <SliderPrimitive.Control className='relative flex h-4 w-full cursor-pointer touch-none items-center'>
              <SliderPrimitive.Track className='relative h-1.5 w-full overflow-hidden rounded-full bg-white/20 transition-[height] group-hover/player:h-2 motion-reduce:transition-none'>
                {!allowSeek && (
                  <span
                    aria-hidden
                    className='absolute inset-y-0 left-0 rounded-full bg-white/35'
                    style={{ width: `${watchedPct}%` }}
                  />
                )}
                <SliderPrimitive.Indicator className='rounded-full bg-[#00a8f1]' />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb className='block size-3.5 rounded-full bg-white shadow ring-2 ring-[#00a8f1] focus-visible:outline-none focus-visible:ring-4' />
            </SliderPrimitive.Control>
          </SliderPrimitive.Root>

          <div className='mt-1.5 flex items-center gap-1 sm:gap-2'>
            <button
              type='button'
              onClick={togglePlay}
              disabled={!ready}
              aria-label={playing ? labels.pause : labels.play}
              className={controlButton}
            >
              {playing ? (
                <Pause className='size-5' aria-hidden />
              ) : (
                <Play className='size-5' aria-hidden />
              )}
            </button>
            <button
              type='button'
              onClick={() => seekTo(current - SKIP_SECONDS)}
              disabled={!ready}
              aria-label={labels.rewind}
              className={controlButton}
            >
              <RotateCcw className='size-4.5' aria-hidden />
            </button>
            <button
              type='button'
              onClick={() => seekTo(current + SKIP_SECONDS)}
              disabled={!canForward}
              aria-label={labels.forward}
              title={canForward ? undefined : labels.skipLocked}
              className={controlButton}
            >
              <RotateCw className='size-4.5' aria-hidden />
            </button>
            <button
              type='button'
              onClick={toggleMute}
              disabled={!ready}
              aria-label={muted ? labels.unmute : labels.mute}
              className={controlButton}
            >
              {muted ? (
                <VolumeX className='size-5' aria-hidden />
              ) : (
                <Volume2 className='size-5' aria-hidden />
              )}
            </button>

            <span className='ms-1 text-xs font-semibold tabular-nums text-white/90 sm:text-sm'>
              {formatTime(shownTime)}
              <span className='text-white/50'> / {formatTime(duration)}</span>
            </span>

            <span className='flex-1' />

            {!allowSeek && (
              <span className='hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/15 sm:inline-flex'>
                <Lock className='size-3.5 text-amber-400' aria-hidden />
                {labels.completeToSkip}
              </span>
            )}

            {allowSeek && (
              <button
                type='button'
                onClick={cycleSpeed}
                disabled={!ready}
                aria-label={`${labels.speed}: ${speed}x`}
                className={cn(controlButton, 'w-auto gap-1 px-2.5 text-xs font-bold')}
              >
                <Gauge className='size-4' aria-hidden />
                {speed}x
              </button>
            )}

            {fullscreenSupported && (
              <button
                type='button'
                onClick={toggleFullscreen}
                aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
                className={controlButton}
              >
                {fullscreen ? (
                  <Minimize className='size-5' aria-hidden />
                ) : (
                  <Maximize className='size-5' aria-hidden />
                )}
              </button>
            )}
          </div>
        </div>
      </DirectionProvider>

      {covered && (
        <div
          role='alertdialog'
          aria-labelledby='video-shield-title'
          className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0b0e2e] px-6 text-center text-white'
        >
          <span className='inline-flex size-14 items-center justify-center rounded-full bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30'>
            <ShieldAlert className='size-7' aria-hidden />
          </span>
          <p id='video-shield-title' className='text-base font-bold sm:text-lg'>
            {devtoolsOpen ? labels.shieldDevtoolsTitle : labels.shieldTitle}
          </p>
          <p className='max-w-md text-sm text-white/70'>
            {devtoolsOpen ? labels.shieldDevtoolsMessage : labels.shieldMessage}
          </p>
          {!devtoolsOpen && (
            <button
              type='button'
              onClick={() => setShield(null)}
              className='mt-1 inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#00a8f1] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0090d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none'
            >
              {labels.shieldResume}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
