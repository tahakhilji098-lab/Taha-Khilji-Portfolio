# Taha Khilji — Portfolio

Single-page portfolio website for Taha Khilji, graphic designer and brand identity specialist. Features selected projects, services, about, design process, client testimonials, and a contact CTA.

## Stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Motion](https://motion.dev/) for animations, [Lenis](https://lenis.darkroom.engineering/) for smooth scrolling, [Embla Carousel](https://www.embla-carousel.com/) for the projects carousel, [Lucide](https://lucide.dev/) icons

## Getting Started

**Prerequisites:** Node.js and npm

```bash
npm install
npm run dev
```

Runs the dev server at http://localhost:3000.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Build the production site to `dist/` |
| `npm run preview`  | Preview the production build         |
| `npm run lint`     | Type-check with `tsc --noEmit`       |

## Deployment

The site is fully static. Deploy by pointing any static host (Vercel, Netlify, GitHub Pages) at the project root:

- Build command: `npm run build`
- Output directory: `dist`
- No environment variables are required.
