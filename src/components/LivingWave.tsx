import React, { useRef, useEffect } from 'react';
import { STAGE_ANCHORS } from './processAnchors';

interface MagneticSilkWaveProps {
  focusX: number;
  velocity: number;
  breathe: boolean;
  reveal: boolean;
  reducedMotion?: boolean;
  frameEl?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

interface WaveState {
  currentFocusX: number;
  targetFocusX: number;
  velocity: number;
  pulseProgress: number;
  pulseActive: boolean;
  pulseFromX: number;
  pulseToX: number;
  pocketX: number; // where the reading pocket currently sits (follows active anchor)
  pocketVelocity: number;
  breathPhase: number;
  fibrePhase: number; // for continuous fibre drift
  time: number;
  revealProgress: number;
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;
  dpr: number;
  raf: number;
  lastFrame: number;
  paused: boolean;
  anchorInsetPx: number; // px from canvas left edge to content frame left
  anchorSpanPx: number; // content frame width (same box the stage grid lives in)
  props: MagneticSilkWaveProps;
}

// Overscan in px: extend canvas rendering beyond visible viewport edges
// so first/last anchors don't have asymmetrically truncated Gaussian falloff
const OVERSCAN = 200;

export const MagneticSilkWave: React.FC<MagneticSilkWaveProps> = ({
  focusX,
  velocity,
  breathe,
  reveal,
  reducedMotion = false,
  frameEl,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<WaveState>({
    currentFocusX: STAGE_ANCHORS[0],
    targetFocusX: STAGE_ANCHORS[0],
    velocity: 0,
    pulseProgress: 1,
    pulseActive: false,
    pulseFromX: STAGE_ANCHORS[0],
    pulseToX: STAGE_ANCHORS[0],
    pocketX: STAGE_ANCHORS[0],
    pocketVelocity: 0,
    breathPhase: 0,
    fibrePhase: 0,
    time: 0,
    revealProgress: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    width: 0,
    height: 0,
    dpr: 1,
    raf: 0,
    lastFrame: 0,
    paused: false,
    anchorInsetPx: 0,
    anchorSpanPx: 0,
    props: { focusX, velocity, breathe, reveal, reducedMotion },
  });

  // Sync props into state ref without re-running the render loop
  useEffect(() => {
    const s = stateRef.current;
    const prevTarget = s.targetFocusX;
    const newTarget = focusX;

    if (Math.abs(prevTarget - newTarget) > 0.001) {
      // Retarget: if a pulse is already in flight, start from the current pulse position
      if (s.pulseActive && s.pulseProgress < 1) {
        const eased = easeInOut(s.pulseProgress);
        s.pulseFromX = s.pulseFromX + (s.pulseToX - s.pulseFromX) * eased;
      } else {
        s.pulseFromX = s.currentFocusX;
      }
      s.pulseToX = newTarget;
      s.pulseProgress = 0;
      s.pulseActive = true;
    }

    s.targetFocusX = newTarget;
    s.props = { focusX, velocity, breathe, reveal, reducedMotion };
  }, [focusX, velocity, breathe, reveal, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const s = stateRef.current;

    // ── Resize ──────────────────────────────────────────────────
    const measureFrame = () => {
      const frame = frameEl?.current;
      if (!frame) return;
      const wr = container.getBoundingClientRect();
      const fr = frame.getBoundingClientRect();
      s.anchorInsetPx = fr.left - wr.left;
      s.anchorSpanPx = fr.width;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      s.dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.width = rect.width;
      s.height = rect.height;
      canvas.width = s.width * s.dpr;
      canvas.height = s.height * s.dpr;
      canvas.style.width = `${s.width}px`;
      canvas.style.height = `${s.height}px`;
      measureFrame();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    if (frameEl?.current) ro.observe(frameEl.current);
    resize();

    // ── Mouse tracking ───────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      s.mouseX = (e.clientX - rect.left) / rect.width;
      s.mouseY = (e.clientY - rect.top) / rect.height;
    };
    const onMouseLeave = () => {
      s.mouseX = 0.5;
      s.mouseY = 0.5;
    };
    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // ── Pause when off-screen (IntersectionObserver) ─────────────
    const io = new IntersectionObserver(
      (entries) => {
        s.paused = !entries[0].isIntersecting;
        if (!s.paused && s.raf === 0) {
          s.lastFrame = performance.now();
          s.raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.01 },
    );
    io.observe(container);

    // ── Pause when tab hidden ────────────────────────────────────
    const onVisibilityChange = () => {
      s.paused = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ── Render loop ──────────────────────────────────────────────
    s.lastFrame = performance.now();

    const loop = () => {
      if (s.paused) {
        s.raf = 0;
        return;
      }

      const now = performance.now();
      const dt = Math.min(now - s.lastFrame, 50) / 1000;
      s.lastFrame = now;

      const rm = s.props.reducedMotion;

      // Reveal
      if (s.props.reveal && s.revealProgress < 1) {
        s.revealProgress = Math.min(1, s.revealProgress + dt * 0.7);
      }

      // Spring to target focusX
      const springK = 90, springD = 19, springM = 0.85;
      const dx = s.targetFocusX - s.currentFocusX;
      s.velocity += ((springK * dx - springD * s.velocity) / springM) * dt;
      s.currentFocusX += s.velocity * dt;

      // Pocket spring (follows active anchor with lag)
      const pocketDx = s.targetFocusX - s.pocketX;
      s.pocketVelocity += ((60 * pocketDx - 14 * s.pocketVelocity) / 0.9) * dt;
      s.pocketX += s.pocketVelocity * dt;

      // Travelling pulse
      if (s.pulseActive) {
        const speed = rm ? 10 : 2.0; // instant under reduced motion
        s.pulseProgress = Math.min(1, s.pulseProgress + dt * speed);
        if (s.pulseProgress >= 1) s.pulseActive = false;
      }

      // Breathe and fibre drift
      if (s.props.breathe && !rm) {
        s.breathPhase += dt * 0.45;
        s.fibrePhase += dt * 0.18; // slow continuous drift
      }

      s.time += dt;

      draw(canvas, s);
      s.raf = requestAnimationFrame(loop);
    };

    s.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} aria-hidden="true" />
    </div>
  );
};

/* ─── Helpers ─── */

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Convert normalised t (0–1 across visible width) to overscan canvas X */
function tToX(t: number, W: number): number {
  return -OVERSCAN + t * (W + OVERSCAN * 2);
}

/**
 * The ONLY mapping between stage-anchor space and wave canvas space.
 * Anchor fractions live on the measured content frame (.msj-stage-layer),
 * which is the same box the CSS grid positions the numbers in — so the
 * Gaussian crest peak lands exactly under the active number's centre.
 * Returns t in canvas normalised units (accounting for OVERSCAN).
 */
function anchorCanvasT(frac: number, s: WaveState, W: number): number {
  const span = s.anchorSpanPx;
  if (!span || !W) return frac;
  const px = s.anchorInsetPx + frac * span;
  return (px + OVERSCAN) / (W + OVERSCAN * 2);
}

/**
 * Crest Y at normalised horizontal position t.
 * baselineY: flat far baseline in canvas px
 * amp: Gaussian peak amplitude in px
 * sigma: Gaussian width in normalised units (0–1)
 * fx: current focus position in normalised units
 */
function crestY(
  t: number,
  baselineY: number,
  amp: number,
  sigma: number,
  fx: number,
  time: number,
  breathAmp: number,
  my: number,
): number {
  const dist = t - fx;
  const influence = Math.exp(-(dist * dist) / (2 * sigma * sigma));
  // Subtle folds give the silky texture
  const fold1 = Math.sin(t * Math.PI * 1.4 + time * 0.25) * amp * 0.055;
  const fold2 = Math.sin(t * Math.PI * 2.8 - time * 0.18) * amp * 0.022;
  const fold3 = Math.sin(t * Math.PI * 4.5 + time * 0.12) * amp * 0.008;
  return baselineY - amp * influence + fold1 + fold2 + fold3 + breathAmp + my;
}

/* ─── Drawing ─── */

function draw(canvas: HTMLCanvasElement, s: WaveState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = s.width;
  const H = s.height;
  const dpr = s.dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (s.revealProgress <= 0) return;

  const fxt = anchorCanvasT(s.currentFocusX, s, W);
  const pocketT = anchorCanvasT(s.pocketX, s, W);
  const mx = (s.mouseX - 0.5) * 5;
  const my = (s.mouseY - 0.5) * 2.5;
  const breathAmp = s.props.breathe && !s.props.reducedMotion ? Math.sin(s.breathPhase) * 2 : 0;
  const revealE = s.revealProgress < 1 ? 1 - Math.pow(1 - s.revealProgress, 3) : 1;

  // ── Theatre geometry ──────────────────────────────────────────
  // Raised baseline: crest apex targets ~28–30% from top, numbers sit at ~35–40% from top
  const baselineY = H * 0.76;
  // Larger amplitude so Gaussian apex reaches close under the numbers
  const crestAmplitude = H * 0.48 * revealE;
  // Gaussian sigma in normalised units (~200px at 1919px wide)
  const sigma = 0.055;

  drawDeepFolds(ctx, W, H, baselineY, crestAmplitude, sigma, fxt, mx, my, breathAmp, revealE, s.time);
  drawSilkBody(ctx, W, H, baselineY, crestAmplitude, sigma, fxt, mx, my, breathAmp, revealE, s.time);
  drawReadingPocket(ctx, W, H, baselineY, crestAmplitude, sigma, pocketT, mx, my, breathAmp, revealE, s.time);
  drawFilaments(ctx, W, H, baselineY, crestAmplitude, sigma, fxt, mx, my, breathAmp, revealE, s.time, s.fibrePhase, s.props.reducedMotion ?? false);
  drawSpecularRidge(ctx, W, H, baselineY, crestAmplitude, sigma, fxt, mx, my, breathAmp, revealE, s.time);
  drawCrestGlow(ctx, W, H, baselineY, crestAmplitude, fxt, mx, my, revealE);
  drawTravellingPulse(ctx, W, H, baselineY, crestAmplitude, sigma, fxt, mx, my, breathAmp, revealE, s);
}

/* ─── Layer: Deep folds (secondary silk layers offset from main crest) ─── */
function drawDeepFolds(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number, sigma: number,
  fx: number, mx: number, my: number,
  breathAmp: number, reveal: number, time: number,
) {
  // 3 secondary fold layers, each offset from main crest
  const folds = [
    { hShift: 0.028, vShift: 0.03, ampScale: 0.28, alpha: 0.13 },
    { hShift: -0.022, vShift: 0.055, ampScale: 0.22, alpha: 0.10 },
    { hShift: 0.015, vShift: 0.08, ampScale: 0.16, alpha: 0.07 },
  ];

  for (const fold of folds) {
    const layerAmp = amp * fold.ampScale;
    const layerBaselineY = baselineY + fold.vShift * amp;
    const alpha = fold.alpha * reveal;
    const fxShifted = fx + fold.hShift;

    ctx.beginPath();
    ctx.moveTo(tToX(0, W), H + 10);

    const sections = 80;
    for (let i = 0; i <= sections; i++) {
      const t = i / sections;
      const x = tToX(t, W) + mx;
      const y = crestY(t, layerBaselineY, layerAmp, sigma * 1.6, fxShifted, time, breathAmp, my);
      if (i === 0) ctx.lineTo(x, y);
      else {
        const prevT = (i - 1) / sections;
        const prevX = tToX(prevT, W) + mx;
        ctx.quadraticCurveTo((prevX + x) / 2, y, x, y);
      }
    }

    ctx.lineTo(tToX(1, W), H + 10);
    ctx.closePath();

    // Gradient: cobalt near crest → fully transparent well before bottom
    const apexY = layerBaselineY - layerAmp;
    const fadeEndY = Math.min(apexY + 200, H * 0.92);
    const grad = ctx.createLinearGradient(0, apexY, 0, fadeEndY);
    grad.addColorStop(0, `rgba(14, 58, 170, ${alpha})`);
    grad.addColorStop(0.45, `rgba(8, 32, 95, ${alpha * 0.5})`);
    grad.addColorStop(1, `rgba(4, 15, 50, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

/* ─── Layer: Main silk body ─── */
function drawSilkBody(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number, sigma: number,
  fx: number, mx: number, my: number,
  breathAmp: number, reveal: number, time: number,
) {
  ctx.beginPath();
  ctx.moveTo(tToX(0, W), H + 10);

  const sections = 100;
  for (let i = 0; i <= sections; i++) {
    const t = i / sections;
    const x = tToX(t, W) + mx;
    const y = crestY(t, baselineY, amp * 0.58, sigma * 1.25, fx, time, breathAmp, my);
    if (i === 0) ctx.lineTo(x, y);
    else {
      const prevT = (i - 1) / sections;
      const prevX = tToX(prevT, W) + mx;
      ctx.quadraticCurveTo((prevX + x) / 2, y, x, y);
    }
  }

  ctx.lineTo(tToX(1, W), H + 10);
  ctx.closePath();

  // Silk body: cobalt 0.40 near crest apex → alpha 0 within ~200px below baseline
  const apexY = baselineY - amp * 0.58;
  const fadeEndY = Math.min(apexY + 220, H * 0.92);

  const grad = ctx.createLinearGradient(0, apexY, 0, fadeEndY);
  grad.addColorStop(0, `rgba(14, 60, 180, ${0.40 * reveal})`);
  grad.addColorStop(0.18, `rgba(10, 42, 130, ${0.28 * reveal})`);
  grad.addColorStop(0.45, `rgba(7, 27, 80, ${0.14 * reveal})`);
  grad.addColorStop(0.75, `rgba(4, 15, 50, ${0.04 * reveal})`);
  grad.addColorStop(1, `rgba(2, 8, 23, 0)`);
  ctx.fillStyle = grad;
  ctx.fill();
}

/* ─── Layer: Reading pocket (locally reduces wave density behind phase/description) ─── */
function drawReadingPocket(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number, sigma: number,
  pocketX: number,
  mx: number, my: number,
  breathAmp: number, reveal: number, time: number,
) {
  // Centre the pocket on the active anchor's crest apex (pocketX arrives in canvas-t units)
  const cx = tToX(pocketX, W) + mx;
  const apexY = crestY(pocketX, baselineY, amp, sigma, pocketX, time, breathAmp, my);
  // Pocket sits just below the crest apex, centred on where description text goes
  const pcx = cx;
  const pcy = apexY + amp * 0.32;

  // Soft ellipse (~600px wide × 200px tall) that locally cancels wave alpha
  const rx = Math.min(300, W * 0.16);
  const ry = 100;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(pcx, pcy, rx, ry, 0, 0, Math.PI * 2);

  // Use destination-out to locally reduce alpha, then source-over to put a slightly
  // lighter surface — this avoids a visible card while calming the texture
  const pocketGrad = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, rx);
  pocketGrad.addColorStop(0, `rgba(6, 18, 48, ${0.18 * reveal})`);
  pocketGrad.addColorStop(0.55, `rgba(6, 18, 48, ${0.08 * reveal})`);
  pocketGrad.addColorStop(1, 'rgba(6, 18, 48, 0)');
  ctx.fillStyle = pocketGrad;
  ctx.fill();
  ctx.restore();
}

/* ─── Layer: Fine filaments (silk fibres along curve) ─── */
function drawFilaments(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number, sigma: number,
  fx: number, mx: number, my: number,
  breathAmp: number, reveal: number, time: number,
  fibrePhase: number,
  reducedMotion: boolean,
) {
  const FIBRE_COUNT = 55;

  ctx.save();
  for (let f = 0; f < FIBRE_COUNT; f++) {
    const seed = f * 137.508;
    const startT = ((seed * 0.618) % 1) * 0.90 + 0.05;
    const lenT = 0.06 + ((seed * 0.234) % 1) * 0.14;
    const endT = Math.min(startT + lenT, 1.0);
    const midT = (startT + endT) / 2;

    // Drift: fibres slowly shift horizontally over time (disabled under reduced-motion)
    const drift = reducedMotion ? 0 : Math.sin(fibrePhase + seed * 0.4) * 0.005;
    const driftedFx = fx + drift;

    // Y offset per fibre for "layered fabric" look
    const waveOffset = Math.sin(seed * 0.317 + fibrePhase * 0.5) * 4;

    const yS = crestY(startT, baselineY, amp * 0.52, sigma * 1.25, driftedFx, time, breathAmp, my);
    const yM = crestY(midT, baselineY, amp * 0.52, sigma * 1.25, driftedFx, time, breathAmp, my);
    const yE = crestY(endT, baselineY, amp * 0.52, sigma * 1.25, driftedFx, time, breathAmp, my);

    // Opacity peaks near crest, falls off away from it
    const distM = Math.abs(midT - fx);
    const crestInfluence = Math.exp(-(distM * distM) / (2 * sigma * sigma));
    // Base alpha 0.05–0.10, boosted near crest
    const baseAlpha = 0.05 + ((f * 0.17) % 1) * 0.05;
    const alpha = (baseAlpha + crestInfluence * 0.10) * reveal;

    ctx.beginPath();
    ctx.moveTo(tToX(startT, W) + mx, yS + waveOffset);
    ctx.quadraticCurveTo(
      tToX(startT + lenT * 0.45, W) + mx,
      yM - 5 - (f % 3) * 1.2 + waveOffset,
      tToX(endT, W) + mx,
      yE + waveOffset,
    );

    ctx.strokeStyle = `rgba(90, 150, 255, ${alpha})`;
    ctx.lineWidth = 0.5 + crestInfluence * 0.5;
    ctx.stroke();
  }
  ctx.restore();
}

/* ─── Layer: Specular crest ridge (the "silk sheen") ─── */
function drawSpecularRidge(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number, sigma: number,
  fx: number, mx: number, my: number,
  breathAmp: number, reveal: number, time: number,
) {
  // 1. Main specular fill — tight gradient just above the crest line
  ctx.beginPath();
  ctx.moveTo(tToX(0, W), H + 10);

  const sections = 120;
  for (let i = 0; i <= sections; i++) {
    const t = i / sections;
    const x = tToX(t, W) + mx;
    const y = crestY(t, baselineY, amp * 0.64, sigma, fx, time, breathAmp, my);
    if (i === 0) ctx.lineTo(x, y);
    else {
      const prevT = (i - 1) / sections;
      const prevX = tToX(prevT, W) + mx;
      ctx.quadraticCurveTo((prevX + x) / 2, y, x, y);
    }
  }

  ctx.lineTo(tToX(1, W), H + 10);
  ctx.closePath();

  const apexY = baselineY - amp * 0.64;
  const fadeEndY = Math.min(apexY + 180, H * 0.88);
  const ridgeGrad = ctx.createLinearGradient(0, apexY, 0, fadeEndY);
  ridgeGrad.addColorStop(0, `rgba(150, 205, 255, ${0.42 * reveal})`);
  ridgeGrad.addColorStop(0.05, `rgba(110, 178, 255, ${0.28 * reveal})`);
  ridgeGrad.addColorStop(0.15, `rgba(65, 125, 225, ${0.13 * reveal})`);
  ridgeGrad.addColorStop(0.40, `rgba(22, 62, 155, ${0.04 * reveal})`);
  ridgeGrad.addColorStop(1, `rgba(5, 18, 60, 0)`);
  ctx.fillStyle = ridgeGrad;
  ctx.fill();

  // 2. Distinct 1–2px specular stroke traced along the crest apex with blur/glow
  ctx.save();
  ctx.shadowColor = 'rgba(120, 170, 255, 0.6)';
  ctx.shadowBlur = 4;

  ctx.beginPath();
  const strokSections = 120;
  for (let i = 0; i <= strokSections; i++) {
    const t = i / strokSections;
    const x = tToX(t, W) + mx;
    // The specular line traces exactly at the crest apex (amp * 0.64 = same as fill above)
    const y = crestY(t, baselineY, amp * 0.64, sigma, fx, time, breathAmp, my);
    const distFromFocus = Math.abs(t - fx);
    const nearCrest = Math.exp(-(distFromFocus * distFromFocus) / (2 * sigma * sigma));
    // Line alpha: bright near crest, fades away
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    // We'll apply a varying alpha via separate path segments
    if (i > 0 && (i % 8 === 0 || i === strokSections)) {
      const segAlpha = (0.15 + nearCrest * 0.45) * reveal;
      ctx.strokeStyle = `rgba(120, 170, 255, ${segAlpha})`;
      ctx.lineWidth = 1 + nearCrest * 0.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }

  ctx.restore();
}

/* ─── Layer: Crest ambient glow ─── */
function drawCrestGlow(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number,
  fx: number, mx: number, my: number,
  reveal: number,
) {
  const cx = tToX(fx, W) + mx;
  // Glow sits at the crest apex
  const cy = baselineY - amp * 0.64 + my;
  const radiusX = W * 0.11;
  const radiusY = H * 0.16;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);

  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusX);
  glowGrad.addColorStop(0, `rgba(62, 140, 255, ${0.12 * reveal})`);
  glowGrad.addColorStop(0.30, `rgba(30, 90, 220, ${0.05 * reveal})`);
  glowGrad.addColorStop(0.65, `rgba(15, 50, 160, ${0.02 * reveal})`);
  glowGrad.addColorStop(1, 'rgba(8, 25, 80, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fill();
  ctx.restore();
}

/* ─── Layer: Travelling pulse highlight ─── */
function drawTravellingPulse(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  baselineY: number, amp: number, sigma: number,
  fx: number, mx: number, my: number,
  breathAmp: number, reveal: number,
  s: WaveState,
) {
  if (!s.pulseActive || s.pulseProgress >= 1) return;

  const p = s.pulseProgress;
  const eased = easeInOut(p);
  const pulseXFrac = s.pulseFromX + (s.pulseToX - s.pulseFromX) * eased;
  const pulseX = anchorCanvasT(pulseXFrac, s, W);
  const pulseWidth = 0.030 + Math.abs(s.pulseToX - s.pulseFromX) * 0.018 * (s.anchorSpanPx / W || 1);
  const intensity = Math.sin(eased * Math.PI);

  const cx = tToX(pulseX, W) + mx;
  // Pulse travels along the baseline (gives "light moving between anchors" feel)
  const baseY = crestY(pulseX, baselineY, amp * 0.1, sigma * 3.0, fx, s.time, breathAmp, my);
  const glowRadius = W * pulseWidth;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, baseY - 3, glowRadius, glowRadius * 0.45, 0, 0, Math.PI * 2);

  const pulseGrad = ctx.createRadialGradient(cx, baseY - 3, 0, cx, baseY - 3, glowRadius);
  pulseGrad.addColorStop(0, `rgba(200, 230, 255, ${0.50 * intensity * reveal})`);
  pulseGrad.addColorStop(0.25, `rgba(120, 190, 255, ${0.28 * intensity * reveal})`);
  pulseGrad.addColorStop(0.55, `rgba(60, 140, 255, ${0.10 * intensity * reveal})`);
  pulseGrad.addColorStop(1, 'rgba(20, 70, 180, 0)');
  ctx.fillStyle = pulseGrad;
  ctx.fill();

  // Bright leading edge stroke along baseline
  ctx.beginPath();
  ctx.moveTo(cx - glowRadius * 0.55, baseY);
  ctx.quadraticCurveTo(cx, baseY - 5 * intensity, cx + glowRadius * 0.55, baseY);
  ctx.strokeStyle = `rgba(180, 220, 255, ${0.35 * intensity * reveal})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
