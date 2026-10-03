import { GlassLink } from "@/components/ui/GlassLink";
import { site } from "@/content/site";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  return (
    <section className={`page-shell ${styles.contact}`} aria-labelledby="contact-title">
      <p className={styles.eyebrow}>Get in touch</p>
      <h1 id="contact-title">Let&apos;s work<br />together.</h1>
      <p>Have a project in mind, a role to discuss, or a question about my work? I&apos;d like to hear from you.</p>
      <div className={styles.actions}>
        <GlassLink href={`mailto:${site.email}`} emphasis="primary">Email Davin</GlassLink>
        <GlassLink href={site.linkedin} target="_blank" rel="noopener noreferrer">Connect on LinkedIn<span className="sr-only"> (opens in a new tab)</span></GlassLink>
      </div>
      <dl className={styles.details}>
        <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
        <div><dt>Phone</dt><dd><a href={`tel:${site.phone.replaceAll(" ", "")}`}>{site.phone}</a></dd></div>
        <div><dt>Based in</dt><dd>{site.location}</dd></div>
      </dl>
    </section>
  );
}
