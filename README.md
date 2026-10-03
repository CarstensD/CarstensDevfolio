# DevFolio

Next.js personal portfolio. This is the original portfolio repository, updated with the reviewed liquid-glass design. The private Sites preview is managed in a separate checkout.

## Responsibilities

```text
src/
  app/                       Routes, metadata, root composition and global defaults
  components/
    layout/                  Shared header and footer
    ui/                      Shared glass links
  content/                   Portfolio copy, navigation and profile links
  features/
    home/hero/               Hero markup, scoped styles and its motion
      glass-scene.ts         WebGL setup, lifecycle, visibility and rendering
      glass-shaders.ts       Refractive deformation and moving-light treatment
    contact/                 Contact content and direct email/phone links
    work/                    Work-page content; ready for real case studies
  styles/tokens.css          Shared palette, spacing and timing
public/images/               Optimized artwork
```

Keep routes thin. Feature-specific components, styling and animation belong in their feature. Promote controls to shared UI only when they are reusable. Keep profile information and navigation in `src/content/site.ts`; do not duplicate them in renderers.

## Development

- `npm run dev` — local preview
- `npm run lint` — source lint
- `npm run build` — production static export, including type checking

## Hero motion

GSAP reveals the HTML content. A separately loaded Three.js shader gently deforms a studio-rendered glass image and sweeps light across its highlights. It is a 2D refractive treatment, not an interactive 3D mesh. This deliberately bounds the mobile rendering cost while preserving the chosen concept.

The hero includes a pause control, respects reduced motion, and suspends rendering when off-screen or in a hidden tab. The image remains available without JavaScript, WebGL or a successful scene load. Observers, listeners and GPU resources are disposed on unmount.

`public/images/liquid-glass.webp` is original artwork generated with the built-in image-generation tool, then encoded as WebP. Prompt: a transparent smoky optical-glass ribbon in an asymmetric flowing loop, blue-white studio reflections, restrained amber accents, near-black background, no typography or UI.

## Current scope

The liquid-glass hero and shared navigation are implemented. Work is a clearly labelled placeholder linking to GitHub. Experience links to the existing LinkedIn profile. Contact uses direct email and phone links in place of the original form, which had no submission handler; email opens the visitor's mail app and does not claim to send a message automatically.
