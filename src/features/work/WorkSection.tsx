import { GlassLink } from "@/components/ui/GlassLink";
import { site } from "@/content/site";

export function WorkSection() {
  return (
    <section className="page-shell" aria-labelledby="work-title">
      <h1 id="work-title">Selected work</h1>
      <p>Project case studies are being prepared. In the meantime, explore my work on GitHub or get in touch.</p>
      <div className="flex flex-wrap gap-4 mt-8">
        <GlassLink href={site.github} target="_blank" rel="noopener noreferrer" emphasis="primary">Explore GitHub<span className="sr-only"> (opens in a new tab)</span></GlassLink>
        <GlassLink href="/contact">Get in touch</GlassLink>
      </div>
    </section>
  );
}
