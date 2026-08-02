import React from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
  type Variants,
} from 'motion/react';

export { useReducedMotion };

/* ─── Premium Easing ─── */
export const premiumEase = [0.22, 1, 0.36, 1] as const;
export const EASE = premiumEase;
export const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

/* ─── Standard Reveal Transition ─── */
export const revealTransition = {
  duration: 0.72,
  ease: premiumEase,
};

/* ─── Shared Variant Objects ─── */
export const softReveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: revealTransition },
};

export const revealFromLeft = {
  hidden: { opacity: 0, x: -34 },
  visible: { opacity: 1, x: 0, transition: revealTransition },
};

export const revealFromRight = {
  hidden: { opacity: 0, x: 34 },
  visible: { opacity: 1, x: 0, transition: revealTransition },
};

export const revealScale = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: { opacity: 1, scale: 1, transition: revealTransition },
};

export const revealOpacity = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.62, ease: premiumEase } },
};

/* ─── Standard Viewport Config ─── */
export const standardViewport = {
  once: true,
  amount: 0.18,
  margin: '0px 0px -8% 0px' as const,
};

/* ─── Stagger Container Factory ─── */
const staggerContainer = (stagger: number, delayChildren: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

/* ─── Scroll Progress Hooks ─── */

/** Scroll progress of an element's passage through the viewport (0 → 1). */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  return useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  }).scrollYProgress;
}

/** Progress between "first pixel enters" and "section centered". */
export function useSectionEnter(ref: React.RefObject<HTMLElement | null>) {
  return useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  }).scrollYProgress;
}

/* ─── Reveal Component ─── */

interface RevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}

/** Fade + rise when the element scrolls into view. Respects reduced motion. */
export const Reveal: React.FC<RevealProps> = ({
  delay = 0,
  y = 22,
  once = true,
  amount = 0.25,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/* ─── Mask Reveal ─── */

interface MaskRevealProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
  y?: string | number;
  once?: boolean;
}

/** Clip reveal: content slides up inside an overflow-hidden mask. */
export const MaskReveal: React.FC<MaskRevealProps> = ({
  delay = 0,
  duration = 0.8,
  y = '110%',
  once = true,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();
  return (
    <div className="mask-reveal-clip" {...rest}>
      <motion.div
        initial={reduce ? false : { y }}
        whileInView={reduce ? undefined : { y: '0%' }}
        viewport={{ once, amount: 0.5 }}
        transition={{ duration, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/* ─── Stagger Group + Item ─── */

interface StaggerGroupProps extends HTMLMotionProps<'div'> {
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
}

/** Stagger container — pairs with <StaggerItem>. */
export const StaggerGroup: React.FC<StaggerGroupProps> = ({
  stagger = 0.08,
  delayChildren = 0,
  once = true,
  amount = 0.2,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      variants={staggerContainer(stagger, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  y?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ y = 22, children, ...rest }) => {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };
  return (
    <motion.div variants={variants} {...rest}>
      {children}
    </motion.div>
  );
};

/* ─── ScrollReveal ─── */

export type ScrollRevealDirection = 'up' | 'left' | 'right' | 'scale' | 'opacity';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  direction?: ScrollRevealDirection;
  delay?: number;
  duration?: number;
  amount?: number;
  once?: boolean;
}

const hiddenState = (direction: ScrollRevealDirection) => {
  switch (direction) {
    case 'left':
      return { opacity: 0, x: -34 };
    case 'right':
      return { opacity: 0, x: 34 };
    case 'scale':
      return { opacity: 0, scale: 0.985 };
    case 'opacity':
      return { opacity: 0 };
    default:
      return { opacity: 0, y: 26 };
  }
};

/** Shared scroll-in reveal. Distances stay within the site's motion limits. */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  direction = 'up',
  delay = 0,
  duration = 0.72,
  amount = 0.18,
  once = true,
  children,
  ...rest
}) => {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      data-scroll-reveal
      initial={hiddenState(direction as ScrollRevealDirection)}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin: '0px 0px -8% 0px' }}
      transition={{ duration, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/* ─── Scroll Drift ─── */

/** Helper: scroll-linked drift that stays inert under reduced motion. */
export function useScrollDrift(
  ref: React.RefObject<HTMLElement | null>,
  distance: number,
  reduce: boolean | null
) {
  const progress = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  }).scrollYProgress;
  const y = useTransform(progress, [0, 1], [0, -distance]);
  return { style: reduce ? undefined : { y } };
}
