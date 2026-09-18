# Taha Khilji Portfolio — UI/UX Redesign Brief & Master Prompt

## 1. Design Audit (current state)

**Strengths**
- Dark canvas + restrained blue accent reads premium and confident.
- The tilted "skateboard deck" service panels are a genuinely distinctive layout choice — most portfolios don't have this. It's underused right now (static, no real interaction).
- Editorial italic serif on "Impossible to Ignore" gives the hero a nice tonal break from the grotesk headline.
- Process section (01–04) is legitimate as a numbered sequence — it's a real process, not decoration.

**What reads generic**
- Dark background + one bright accent color is currently the most common "AI-generated portfolio" default. It's not wrong, but on its own it doesn't say *graphic designer* — it could belong to any SaaS product or dev portfolio.
- No visual vocabulary from design craft itself: no grids, registration marks, color swatches, typographic specimens, crop marks — the actual tools/language of the profession you're in.
- Hover states and scroll reveals are present but generic (fade-up, scale-on-hover) — nothing yet feels authored specifically for *this* site.
- The deck-shaped services rail is your best asset and it's static — it should be the centerpiece interaction, not a passive image row.

**Direction**
Keep the dark/blue foundation — don't discard it, it's a good base. Build ONE real signature interaction around "revealing the layers underneath a design" (grids, swatches, duotone-to-color), literally dramatizing what you do for clients. Keep everything else disciplined and quiet so that signature actually lands. Spend the "boldness budget" in one place.

---

## 2. Design System (Tokens)

### Color
| Token | Hex | Use |
|---|---|---|
| Ink (base bg) | `#05070D` | Page background, deepest layer |
| Panel | `#0B1220` | Cards, elevated surfaces |
| Panel Border | `#1B2436` | Hairline dividers, card outlines |
| Off-White | `#F4F4F1` | Body text (never pure white — warmer, easier on dark bg) |
| Signal Blue | `#3B6EF6` | Primary accent — links, primary CTA, active states (your existing blue, slightly refined) |
| Registration Coral | `#FF5A36` | Micro-accents only — availability dot, hover pops, progress fills. Named after print registration-mark color. Never used as a large fill. |
| Swatch Yellow | `#F5C518` | Tertiary micro-accent — tags, tiny highlights only |

Add a very subtle film-grain/noise texture (2–3% opacity) over the whole background — ties to the "cinematic, premium print" feel without being heavy.

### Typography
- **Display (headlines):** A bold variable grotesk — Clash Display, General Sans, or Space Grotesk at 600–700 weight, tight tracking (-2%).
- **Accent (emotive phrases):** Keep an italic serif — Fraunces Italic or your current serif — reserved for one phrase per section max.
- **Body:** Inter or Neue Montreal, 400 weight, generous line-height (1.6+).
- **Mono/Label (new — this is the craft signal):** JetBrains Mono or IBM Plex Mono, uppercase, wide letter-spacing, used for *everything* structural: eyebrows, project years/categories, stat labels, nav items on hover state, coordinates. This one addition does more to signal "designer" than any color choice.

### Layout
- 12-column grid, generous gutters, asymmetric bento for work grid (keep).
- Deck-shaped service rail becomes horizontally draggable with snap + 3D perspective (see Section 3).
- Corner "registration crosshair" marks (small SVG `+` in circle, like a printer's registration mark) at section corners — recurring motif, always in Registration Coral, always small (12–16px), never decorative filler elsewhere.

### Signature element
**"The Layer Reveal"** — a cursor-tracked spotlight mask that peels back the dark/duotone surface of key images (hero collage, project thumbnails, your portrait) to reveal a thin grid overlay + color values underneath, wherever the cursor moves. It's a literal dramatization of "what's underneath good design" — grounded directly in your actual craft rather than a generic effect. Used in exactly 3 places: hero collage, work-grid thumbnails on hover, about-section portrait. Nowhere else.

---

## 3. Section-by-Section Spec

### Nav
- Slim glass/blur bar. Logo "Taha Khilji" in mono caps, with a small blinking dot after it (like a text cursor) in Signal Blue — subtle, always-on, 1.2s blink cycle.
- Nav links: underline draws itself left-to-right on hover (like a pen stroke), not a fade.
- CTA "Start a Project": filled pill, magnetic hover (button pulls slightly toward cursor within its bounds), arrow icon slides right on hover.
- On scroll: background blur intensifies + hairline bottom border fades in. Hide-on-scroll-down, reveal-on-scroll-up.

### Hero
- Eyebrow "TAHA KHILJI — GRAPHIC DESIGNER": mono, wide tracking, tiny color dot before it that cycles Blue → Coral → Yellow every 2s (a "color picker" nod).
- Headline: split-text stagger reveal on load — words rise + un-blur, 60ms stagger. "Impossible to Ignore" in italic serif, Signal Blue.
- Subtext fades up 150ms after headline settles.
- Availability badge: pulsing coral dot (soft scale 1→1.3→1 pulse, 2s loop).
- Hero collage (product/branding mockups): parallax on mouse-move — each image layer moves at a different speed (closer images move more). Apply Layer Reveal on hover: a soft circular mask follows the cursor, revealing a faint grid + hex-value labels under the image, like inspecting a design file.
- Background: slow-moving diagonal light sweep, very subtle, 12–15s loop, plus grain texture.

### Selected Work grid
- On hover: image scales 1.05, gradient overlay rises from bottom, project name + category slide up 12px, arrow icon rotates 45°→0°.
- Custom cursor on hover: small circle with "View" label replaces default cursor over cards.
- Category tag: mono pill with a small color dot matching that project's dominant brand color — reinforces "I assign color systems for a living."
- Scroll-in: diagonal stagger (not simple row-by-row) — cards nearer top-left animate in first, wave outward.
- "See More Work": mono button, arrow loops on hover, underline draws in.

### Services Rail (the skateboard decks — your signature-adjacent asset)
- Make it horizontally **drag-scrollable** with momentum/inertia (Lenis or native scroll-snap + JS) instead of a static row.
- Each panel: as it approaches viewport center, its 3D tilt straightens toward flat/frontal; as it exits, it tilts away — like flipping through a physical rack of decks.
- Idle state: very slow ambient drift so it never feels static.
- Hover: panel shifts from grayscale/duotone to full color — "bringing the design to life" on contact.
- Keep the "Move your cursor across the services" hint but make it also respond to actual mouse-X position, not just drag.

### About
- Portrait: duotone (blue/black) at rest. A soft "flashlight" circle follows the cursor over the image, revealing full color within its radius (Layer Reveal, applied to a person for the first time — should feel intimate, not gimmicky).
- Stats (120+ / 65+ / 5+): animate as count-up when scrolled into view, mono numerals, small corner-bracket dividers (like crop marks) between each stat instead of plain lines.
- Tool icons row: grayscale at rest, colorize + small tooltip on hover.
- Download Résumé button: icon does a small "unfold" rotation on hover.

### Process (01–04)
- Oversized ghost/outline numerals behind each card, moving slightly slower than the card content on scroll (subtle parallax).
- Icons draw themselves in (stroke-dasharray reveal) when the card enters viewport.
- A thin horizontal line beneath all four cards fills left-to-right as the user scrolls through the section — literal "progress" visualization.
- Hover: card lifts, soft accent-color glow shadow, icon fills solid.

### Testimonials
- Center card scaled to 100%, side cards scaled down and dimmed — classic focus carousel, but with smooth spring easing.
- Progress indicator: a thin line that draws itself rather than plain dots, matching the mono/craft aesthetic.
- Oversized decorative quote mark in the italic serif as background texture behind the quote.
- Auto-advance, pause on hover/touch.

### Marquee (Aurora / Velora / Nexora…)
- Seamless infinite scroll, two rows moving opposite directions for more energy.
- Hover on a word: pauses that row briefly, word scales up slightly and picks up color.

### Contact / CTA
- "remarkable." rendered with a slow animated gradient sweep across Blue → Coral.
- Contact cards: 3D tilt-on-hover following cursor position (like tilting a physical business card).
- Click-to-copy email with a small toast: "Copied." (plain, interface-voiced, no exclamation).
- Soft pulsing radial glow behind the section + grain texture.

### Footer
- Minimal mono type. "Back to top" arrow with eased smooth-scroll.
- Small blinking dot echoing the nav logo treatment, for continuity.

---

## 4. Global Motion Rules

- **Page load:** one short (600–800ms) intro where four corner registration crosshairs slide in and align at center, then dissolve into the hero. Skippable; skipped entirely if `prefers-reduced-motion` is set.
- **Scroll reveals:** consistent fade + 24px rise, 60–100ms stagger across siblings. IntersectionObserver-driven. Don't reinvent this per section — one system, applied everywhere.
- **Cursor:** custom small dot + trailing ring, desktop only, morphs to contextual labels ("View", "Drag", "Copy"). Disabled entirely on touch devices.
- **Magnetic buttons:** primary CTAs pull slightly toward the cursor within their bounds (GSAP quickTo or equivalent).
- **Color discipline:** Coral and Yellow are used only for micro-moments (dots, tags, progress, hover pops) — never large fills. This restraint is what makes the Layer Reveal signature land instead of getting lost in a noisy palette.
- **Accessibility:** visible focus rings in Signal Blue on all interactive elements; respect `prefers-reduced-motion` (disable parallax, cursor-follow, and the load sequence — keep only simple fades); mobile disables parallax/cursor effects but keeps stagger reveals.

---

## 5. Suggested Stack

Vanilla HTML/CSS/JS (or your existing framework) + **GSAP** with **ScrollTrigger** for scroll-tied animation, **Lenis** for smooth/inertia scroll (used for the drag-scroll services rail), and **SplitType** (free) for the headline split-text reveal. If the current site is React-based, Framer Motion can replace GSAP for component-level transitions, but keep GSAP+ScrollTrigger for the deck-rail 3D scroll-binding — it's the more reliable tool for that specific interaction.

---

## 6. MASTER PROMPT — copy-paste this to your DeepSeek V4 Flash / OpenCode agent

```
You are acting as a senior UI/UX designer and frontend developer redesigning an existing personal portfolio website for Taha Khilji, a graphic designer. Do not start from a generic template — every choice below is deliberate and specific to this site. Follow this spec closely, but use good engineering judgment on implementation details.

CONTEXT
The site currently has: a nav (logo, Work/Services/About/Contact, "Start a Project" CTA), a hero with headline + italic-accent phrase + two CTAs + a product mockup collage, a "Selected Work" bento grid of 6 projects, a horizontally-arranged row of tilted "skateboard deck"-shaped panels representing services, an About section with portrait + stats + tool icons, a 4-step numbered Process section, a testimonial carousel, an infinite marquee of client/brand names, and a contact CTA section. Keep this overall information architecture. The redesign is about visual system and motion, not restructuring content.

DESIGN TOKENS — implement these exactly as CSS variables:
- --ink: #05070D (page background)
- --panel: #0B1220 (card surfaces)
- --panel-border: #1B2436 (hairline borders)
- --text: #F4F4F1 (body text, warm off-white, never pure white)
- --accent-blue: #3B6EF6 (primary accent — CTAs, links, active states)
- --accent-coral: #FF5A36 (micro-accents ONLY — availability dot, hover pops, progress fills — never a large fill)
- --accent-yellow: #F5C518 (tertiary micro-accent — tags, tiny highlights only)

Add a subtle film-grain noise texture over the background at ~2-3% opacity (SVG turbulence filter or a repeating noise PNG).

TYPOGRAPHY
- Display/headline font: a bold variable grotesk (Clash Display, General Sans, or Space Grotesk), 600-700 weight, tight tracking.
- Accent font: an italic serif (Fraunces Italic or similar) — reserved for exactly one emphasized phrase per section, in --accent-blue.
- Body font: Inter or Neue Montreal, 400 weight, line-height 1.6+.
- Mono/label font: JetBrains Mono or IBM Plex Mono, uppercase, wide letter-spacing — use this for ALL eyebrows, project year/category tags, stat labels, and any structural/meta text. This is a deliberate craft signal — apply it consistently everywhere small labels appear.

SIGNATURE INTERACTION — "The Layer Reveal"
Build a reusable cursor-tracked spotlight/mask component: a circular mask (120-160px radius, soft-edged) follows the cursor over a target image. Inside the mask, reveal a secondary "layer" underneath the base image — a faint grid overlay with small hex-color-value labels, or a color version of an image that's duotone/grayscale outside the mask. Implement this as a reusable component and apply it in exactly THREE places: (1) the hero's product mockup collage, (2) project thumbnails in the Selected Work grid on hover, (3) the About section portrait, where hovering reveals full color within the spotlight while the rest stays duotone blue/black. Do not use this effect anywhere else — it should stay special.

SECTION-BY-SECTION REQUIREMENTS

Nav: slim glass-blur bar. Logo has a small blinking cursor-dot after it in --accent-blue (1.2s blink). Nav links get a hover underline that draws left-to-right (animate width or use an SVG line, not a fade). Primary CTA button is a magnetic button (translates slightly toward cursor within its bounding box on mousemove, GSAP quickTo or equivalent) with an arrow icon that slides right on hover. On scroll, increase backdrop blur and fade in a bottom hairline border; hide nav on scroll-down, reveal on scroll-up.

Hero: eyebrow text in mono with a small dot before it that cycles through blue/coral/yellow every 2s. On page load, split the headline into words and animate each rising + un-blurring with a 60ms stagger (use SplitType or manual span-wrapping + GSAP). The italic accent phrase animates in slightly after the rest. Subtext fades up 150ms after headline. Availability badge has a pulsing dot (scale 1 to 1.3 and back, 2s ease loop). Apply parallax-on-mousemove to the hero collage images (different depth = different movement speed) plus the Layer Reveal effect on hover.

Selected Work grid: on hover, scale image to 1.05, rise a gradient overlay from the bottom, slide up the project name/category by 12px, rotate the arrow icon from 45° to 0°. Replace the default cursor with a small circle showing "View" when hovering a card. Category tags are mono pills with a small colored dot matching that project's dominant color. Scroll-triggered entrance should stagger diagonally (top-left cards animate first, wave outward) rather than simple row order.

Services rail (the tilted deck panels): convert to a horizontally drag-scrollable rail with momentum/inertia (use Lenis, or native scroll-snap-x plus a JS drag handler). Bind each panel's 3D rotation/tilt to its scroll position relative to viewport center — panels flatten toward frontal as they approach center and tilt away as they exit, simulating flipping through a physical rack. Add slow ambient auto-drift when idle. On hover, transition each panel from grayscale/duotone to full color.

About: portrait uses the Layer Reveal duotone-to-color hover effect described above. Stats count up from 0 when scrolled into view (mono numerals). Replace plain divider lines between stats with small corner-bracket "crop mark" style dividers. Tool icons are grayscale at rest, colorize with a tooltip on hover. Download Résumé button icon does a small unfold/rotate micro-animation on hover.

Process (4 steps): render oversized ghost/outline numerals behind each card that scroll at a slightly slower parallax rate than the card content. Icons animate as stroke-dasharray line-draws when scrolled into view. Add a thin horizontal progress line beneath all four cards that fills left-to-right tied to scroll progress through the section. Cards lift with an accent-glow shadow on hover.

Testimonials: center card at full scale, side cards scaled down and dimmed, smooth spring easing on transitions. Replace dot pagination with a thin progress line that draws itself. Add an oversized decorative quote mark in the italic serif font as background texture. Auto-advance with pause on hover/touch/drag.

Marquee: two rows of client names scrolling in opposite directions, seamless infinite loop. Hovering a word pauses that row briefly and scales/colorizes just that word.

Contact/CTA: animate a slow gradient sweep (blue to coral) across the word "remarkable." Contact cards tilt in 3D following cursor position within their bounds, like tilting a physical card. Email click-to-copy shows a small toast reading "Copied." (plain, no exclamation mark — match a calm interface voice). Add a soft pulsing radial glow behind the section plus the global grain texture.

Footer: minimal mono type, "Back to top" link does an eased smooth-scroll, small blinking dot matching the nav logo treatment for visual continuity.

GLOBAL RULES
- One consistent scroll-reveal system across the whole site: fade + 24px rise, 60-100ms stagger between siblings, IntersectionObserver-driven. Do not invent a different reveal style per section.
- Optional page-load intro: four small registration-crosshair marks (SVG plus-in-circle icons, in --accent-coral) slide in from the corners and align at center, then dissolve into the hero, total duration under 800ms. Skip entirely if the user has prefers-reduced-motion set.
- Custom cursor: small dot + trailing ring on desktop, morphing to contextual labels ("View", "Drag", "Copy") near relevant elements. Disable completely on touch devices — detect with a pointer/hover media query, don't rely on user-agent sniffing.
- Coral and yellow accents are used ONLY for small/micro moments (dots, tags, progress fills, hover pops) — never as large background fills. This restraint is intentional; the site should stay mostly dark/blue with these as sparks, not washes.
- Respect prefers-reduced-motion globally: disable parallax, cursor-follow effects, and the load sequence; keep only simple opacity fades.
- Visible keyboard focus states on every interactive element, in --accent-blue.
- Fully responsive down to mobile: disable parallax/cursor-follow/3D-tilt effects on small screens and touch devices, but keep the stagger scroll-reveals and count-up stats — those work fine on mobile.

BUILD PROCESS
Build in this order: (1) set up the CSS variable token system and typography first, (2) implement the global scroll-reveal system and apply it site-wide, (3) build the nav and hero with its load sequence, (4) build the Selected Work grid with hover states, (5) build the services drag-rail with 3D scroll-binding — this is the most complex piece, get it working before polishing, (6) build the remaining sections, (7) build the Layer Reveal component last and apply it to its three designated spots, (8) do a final pass for reduced-motion, keyboard focus, and mobile responsiveness. After each major section, briefly self-review against this spec before moving to the next — flag anything that ended up looking like a generic template default rather than what's described here, and fix it before continuing.
```

Paste that whole block into your DeepSeek V4 Flash agent in OpenCode. If it stalls on the deck-rail 3D scroll-binding (usually the hardest part), you can split step 5 out into its own follow-up prompt once the rest of the site is in place.
