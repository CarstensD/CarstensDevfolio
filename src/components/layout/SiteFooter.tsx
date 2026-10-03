import { site } from "@/content/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} {site.name}</span>
      <nav aria-label="Social links">
        <a href={site.github} target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only"> (opens in a new tab)</span></a>
        <a href={site.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<span className="sr-only"> (opens in a new tab)</span></a>
        <a href={`mailto:${site.email}`}>Email</a>
      </nav>
    </footer>
  );
}
