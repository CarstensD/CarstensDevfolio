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
      ribbon-geometry.ts     Procedural ribbon surface and deformation
    contact/                 Contact content and direct email/phone links
    work/                    Work-page content; ready for real case studies
  styles/tokens.css          Shared palette, spacing and timing
public/images/               Optimized artwork
artwork/                     Native 8K master; not shipped to visitors
```

Keep routes thin. Feature-specific components, styling and animation belong in their feature. Promote controls to shared UI only when they are reusable. Keep profile information and navigation in `src/content/site.ts`; do not duplicate them in renderers.

## Development

- `npm run dev` — local preview
- `npm run lint` — source lint
- `npm run typecheck` — explicit TypeScript checks
- `npm run build` — production static export, including type checking

Run these commands from `C:\Workspace\Carstens Workspace\carstens-devfolio` (the project is no longer nested). Use Node.js 22 or later; Node.js 24 LTS is recommended. The static `out/` directory is served with Nginx or another static server; `next start` does not serve this export.

Next.js is pinned to 16.3.8. TypeScript 6.0.3 is the newest version compatible with the ESLint parser's supported range; TypeScript 7 is not used. ESLint checks TypeScript, React Hooks and JSX accessibility directly. The Next.js ESLint preset was removed because its globbing dependency has an unpatched security advisory. Run lint separately because Next.js 16 builds do not run ESLint.

## Hero motion

GSAP reveals the HTML content. A separately loaded Three.js scene renders a procedural ribbon with a polished reflective material. The ribbon surface deforms, its orientation shifts, and blue-white and amber studio lights move around it. Pointer movement adds gentle parallax on devices with a mouse. This is real 3D geometry rather than distortion of a source image.

The hero includes a pause control, respects reduced motion, and suspends rendering when off-screen or in a hidden tab. The image remains available without JavaScript, WebGL or a successful scene load. Observers, listeners and GPU resources are disposed on unmount.

Live rendering uses 30 fps on mobile and 45 fps on desktop, with a two-million-pixel mobile budget and an 8.3-million-pixel desktop budget. Mobile also uses fewer geometry segments. These are limits rather than guaranteed frame rates; performance still needs checking on physical phones.

`artwork/ribbon-8k.png` is a native 7680×4320 render of the scene. `public/images/ribbon-poster.webp` is its lightweight fallback. In development only, pause the ribbon at a preferred pose and select **Export 8K artwork** to download another native PNG. Export temporarily uses a denser mesh and tiled rendering to respect GPU size limits; it restores the live scene afterwards. The 8K master is not a browser texture and does not increase mobile downloads. Production visitors do not see the export control.

## Current scope

The liquid-glass hero and shared navigation are implemented. Work is a clearly labelled placeholder linking to GitHub. Experience links to the existing LinkedIn profile. Contact uses direct email and phone links in place of the original form, which had no submission handler; email opens the visitor's mail app and does not claim to send a message automatically.
