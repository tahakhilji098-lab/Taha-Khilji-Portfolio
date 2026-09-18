# About Section Handoff Report

## 1. Visual Structure & Layout
The About section (`src/components/About.tsx`) is structured into two main columns (handled by `.about-container` in CSS):
- **Left Column (`.about-visual`)**: A visual stage containing a backplane, a clipped portrait image (`.about-portrait`), a tone overlay, and neon edge SVG lines.
- **Right Column (`.about-content`)**: Text content including an eyebrow header, a two-line heading, a description paragraph, a statistics row, a résumé download button, and a list of design tools.

## 2. Dependencies
- **React**: `useRef`, `useState`, `useEffect`.
- **Lucide React**: `Download` icon.
- **Framer Motion (`motion/react`)**: 
  - `useReducedMotion` (used to disable counter animation).
  - `useScroll`, `useTransform` (imported and initialized, but **not actually applied** to any JSX elements in the current implementation).
- **Styles**: Custom CSS extracted from `src/index.css` into `source/about-styles.css`.
- **Fonts**: The project relies on Google Fonts: `JetBrains Mono`, `Playfair Display`, and `Plus Jakarta Sans`.

## 3. Responsive Rules & Media Queries
Responsive layouts are driven by the CSS (extracted in `about-styles.css`), focusing on:
- Stacked layout on mobile, transitioning to a two-column layout on larger screens (via flex or grid in CSS).
- Fluid typography and clamp functions.
- The portrait image uses `sizes` attribute for responsive loading: `(min-width: 1280px) 46vw, (min-width: 1024px) 42vw, (min-width: 768px) 80vw, 100vw`.

## 4. Animations & Interactions

### Entrance Animations (Triggered by IntersectionObserver)
An `IntersectionObserver` triggers when 18% of the section is visible (`threshold: 0.18`, `rootMargin: '0px 0px -8% 0px'`). When triggered, it adds the `.is-revealed` class, which fires CSS transitions defined in `about-styles.css`.

| Target | Trigger | Properties | Values | Timing |
| :--- | :--- | :--- | :--- | :--- |
| `.about-visual-backplane` | `.is-revealed` added | `clip-path`, `transform` | (CSS defined) | 1000ms duration, 70ms delay |
| `.about-neon-edge` | `.is-revealed` added | `stroke-dashoffset` | (CSS defined) | 520ms duration, 80ms delay |
| `.about-eyebrow-rule` | `.is-revealed` added | `transform` | (CSS defined) | 680ms duration, 400ms delay |

### Javascript Counter Animations
| Target | Trigger | Behavior | Timing & Easing | Cleanup |
| :--- | :--- | :--- | :--- | :--- |
| Statistic Numbers | `.is-revealed` state | Increments from 0 to target (120, 65, 5) | Durations: 1600ms, 1500ms, 1400ms. Delay: 870ms. Easing: Cubic ease-out (`1 - (1-p)^3`) | `cancelAnimationFrame` |

*Note: Counter animations are skipped if `useReducedMotion` is true.*

### Hover & Pointer Interactions
| Target | Trigger | Properties |
| :--- | :--- | :--- |
| `.about-stat` | `:hover` | Transforms `.about-stat-value`, expands `.about-stat-rule`, fades `.about-stat-label`. |
| `.about-resume-button` | `:hover` | Transforms icon, reveals `.about-resume-surface`. |
| `.about-tool` | `:hover` | Animates `.tool-icon-frame` and reveals `.about-tool-label` pseudo-elements. |
| `.about-portrait-clip` | `:hover` | Scales `.about-portrait` and triggers `.about-neon-edges` effects. |

## 5. Unapplied / Incomplete Implementations
- **Parallax**: `useScroll` and `useTransform` are initialized to calculate `portraitY`, but this value is never attached to a style prop (e.g. `<motion.div style={{ y: portraitY }}>`). The parallax effect is currently inactive in the codebase.

## 6. Assets Mapping
- `src/assets/icons/tools/photoshop.png` -> `assets/photoshop.png`
- `src/assets/icons/tools/illustrator.png` -> `assets/illustrator.png`
- `src/assets/icons/tools/figma.png` -> `assets/figma.png`
- `src/assets/icons/tools/after-effects.png` -> `assets/after-effects.png`
- `src/assets/images/taha.png` -> `assets/taha.png`
- `public/Taha_Khilji_Resume.pdf` -> `assets/Taha_Khilji_Resume.pdf`
