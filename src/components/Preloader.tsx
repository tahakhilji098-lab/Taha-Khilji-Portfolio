import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import tahaPortrait from '../assets/images/taha.png';
import brandMockup from '../assets/images/brand_mockup_1785252185476.jpg';
import packagingMockup from '../assets/images/packaging_mockup_1785252204708.jpg';
import photoshopIcon from '../assets/icons/tools/photoshop.png';
import illustratorIcon from '../assets/icons/tools/illustrator.png';
import figmaIcon from '../assets/icons/tools/figma.png';
import afterEffectsIcon from '../assets/icons/tools/after-effects.png';
import { optimizedImages } from '../assets/optimized/images';

/* ═══════════════════════════════════════════════════════════════
   CHOREOGRAPHY — independent of asset loading
   ═══════════════════════════════════════════════════════════════ */
const LETTER_DURATION_MS = 900;
const LETTER_STAGGER_MS = 85;
const LETTER_COUNT = 12; // "Taha Khilji."
const REVEAL_TOTAL_MS = LETTER_COUNT * LETTER_STAGGER_MS + LETTER_DURATION_MS; // ~1935ms
const HOLD_AFTER_REVEAL_MS = 300;
const TIMEOUT_MS = 8000;

/* ═══════════════════════════════════════════════════════════════
   ASSET URLS — every image the browser will actually fetch
   ═══════════════════════════════════════════════════════════════ */
const UNSPLASH_URLS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
];

function getAllImageUrls(): string[] {
  const urls: string[] = [];

  urls.push(
    '/images/work/work-01-aureli-brand-identity.png',
    '/images/work/work-02-noma-social-campaign.png',
    '/images/work/work-03-vertex-packaging.png',
    '/images/work/work-04-mono-editorial.png',
    '/images/work/work-05-northline-website.png',
    '/images/work/work-06-clarity-advertising.png',
  );

  for (const img of Object.values(optimizedImages)) {
    if (img.key.startsWith('service-')) urls.push(img.largestUrl);
  }

  urls.push(
    tahaPortrait,
    brandMockup,
    packagingMockup,
    photoshopIcon,
    illustratorIcon,
    figmaIcon,
    afterEffectsIcon,
  );

  urls.push(...UNSPLASH_URLS);

  return [...new Set(urls)];
}

/* ═══════════════════════════════════════════════════════════════
   LETTER DATA
   ═══════════════════════════════════════════════════════════════ */
const NAME = 'Taha Khilji.';
const LETTERS = NAME.split('');

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
interface PreloaderProps {
  isLoading: boolean;
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading, onComplete }) => {
  const reduce = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  /* ── UI state ── */
  const [isMobile, setIsMobile] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [loadPct, setLoadPct] = useState(0);

  /* ── Readiness tracking ── */
  const videoReadyRef = useRef(false);
  const imagesReadyRef = useRef(false);
  const timedOutRef = useRef(false);
  const loadedRef = useRef(0);
  const revealDoneRef = useRef(false);

  /* ── Memoised asset list ── */
  const imageUrls = useMemo(() => getAllImageUrls(), []);
  const totalAssets = 1 + imageUrls.length;

  /* ── Mobile detection ── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     PERCENTAGE COUNTER — rAF-driven, synced to reveal duration
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (reduce) { setLoadPct(100); return; }

    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / REVEAL_TOTAL_MS, 1);
      setLoadPct(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  /* ═══════════════════════════════════════════════════════════
     PHASE 1 — Letter reveal (fixed ~1.9s, always runs fully)
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const t = setTimeout(() => {
      revealDoneRef.current = true;
    }, REVEAL_TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     PHASE 2 — Short hold after reveal settles
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!revealDoneRef.current) {
      const poll = setInterval(() => {
        if (revealDoneRef.current) {
          clearInterval(poll);
          scheduleHoldExit();
        }
      }, 50);
      return () => clearInterval(poll);
    }
    scheduleHoldExit();

    function scheduleHoldExit() {
      setTimeout(() => {
        if (!timedOutRef.current) setIsExiting(true);
      }, HOLD_AFTER_REVEAL_MS);
    }
  }, []);

  /* ═══════════════════════════════════════════════════════════
     GATE — assets must be ready before reveal actually exits.
     If assets aren't ready by the time the hold finishes,
     we wait (name stays fully settled on screen) until they are.
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const check = setInterval(() => {
      const assetsReady = videoReadyRef.current && imagesReadyRef.current;
      if (assetsReady && revealDoneRef.current && !isExiting && !timedOutRef.current) {
        clearInterval(check);
        setIsExiting(true);
      }
    }, 100);
    return () => clearInterval(check);
  }, [isExiting]);

  /* ═══════════════════════════════════════════════════════════
     VIDEO — wait for canplaythrough (readyState >= 4)
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const v = document.querySelector<HTMLVideoElement>('video');
    if (!v) { videoReadyRef.current = true; return; }
    if (v.readyState >= 4) { videoReadyRef.current = true; return; }

    const ok = () => { cleanup(); videoReadyRef.current = true; };
    const fail = () => { cleanup(); videoReadyRef.current = true; };
    const cleanup = () => {
      v.removeEventListener('canplaythrough', ok);
      v.removeEventListener('error', fail);
    };

    v.addEventListener('canplaythrough', ok, { once: true });
    v.addEventListener('error', fail, { once: true });
    return cleanup;
  }, []);

  /* ═══════════════════════════════════════════════════════════
     IMAGES — preload every page image via new Image()
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;

    const onSettled = () => {
      if (cancelled) return;
      loaded++;
      if (loaded >= imageUrls.length) {
        imagesReadyRef.current = true;
      }
    };

    imageUrls.forEach((src) => {
      const img = new Image();
      img.onload = onSettled;
      img.onerror = onSettled;
      img.src = src;
    });

    return () => { cancelled = true; };
  }, [imageUrls]);

  /* ═══════════════════════════════════════════════════════════
     HARD TIMEOUT — 8s force-reveal
     ═══════════════════════════════════════════════════════════ */
  useEffect(() => {
    const t = setTimeout(() => {
      timedOutRef.current = true;
      setIsExiting(true);
    }, TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     EXIT — unmount after swipe-up animation
     ═══════════════════════════════════════════════════════════ */
  const handleExitComplete = useCallback(() => {
    setIsUnmounted(true);
    onCompleteRef.current();
  }, []);

  if (isUnmounted) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ backgroundColor: '#040812' }}
      initial={{ y: 0 }}
      animate={isExiting ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={isExiting ? handleExitComplete : undefined}
      role="progressbar"
      aria-valuenow={loadPct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading portfolio"
    >
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* ── Eyebrow ── */}
        <motion.div
          className="text-center"
          style={{ marginBottom: 24 }}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span
            className="inline-block uppercase"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#6878A0',
            }}
          >
            Independent Graphic Designer
          </span>
        </motion.div>

        {/* ── Letter assembly — blur → sharp cascade ── */}
        <div
          style={{
            fontSize: isMobile ? 'clamp(36px, 10vw, 58px)' : 'clamp(64px, 7vw, 120px)',
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: '-0.035em',
            whiteSpace: 'nowrap',
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'nowrap',
          }}
          aria-label={NAME}
        >
          {LETTERS.map((char, i) => {
            const isKhilji = i >= 5 && i <= 10;
            const isPeriod = i === 11;
            const delay = i * LETTER_STAGGER_MS / 1000;

            return (
              <motion.span
                key={i}
                initial={
                  reduce
                    ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
                    : { opacity: 0, y: 24, filter: 'blur(10px)', scale: 0.96 }
                }
                animate={
                  reduce
                    ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
                    : { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
                }
                transition={{
                  duration: LETTER_DURATION_MS / 1000,
                  delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  color: isPeriod ? '#579DFF' : '#F3F5FC',
                  fontStyle: isKhilji ? 'italic' : undefined,
                  willChange: 'transform, filter, opacity',
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </div>

        {/* ── Percentage counter — synced to reveal ── */}
        <motion.div
          className="flex items-baseline justify-center gap-2"
          style={{ marginTop: 20 }}
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: reduce ? 0 : 0.3 }}
          aria-hidden="true"
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 500,
              color: '#F3F5FC',
              fontVariantNumeric: 'tabular-nums',
              minWidth: '4ch',
              textAlign: 'right',
            }}
          >
            {loadPct}%
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: '#6878A0',
              letterSpacing: '0.03em',
            }}
          >
            {loadPct >= 100 ? 'Opening portfolio' : 'Preparing portfolio'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export { Preloader };
