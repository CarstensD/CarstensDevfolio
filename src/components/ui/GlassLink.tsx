import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./GlassLink.module.css";

type GlassLinkProps = ComponentProps<typeof Link> & {
  emphasis?: "primary" | "secondary";
};

export function GlassLink({ emphasis = "secondary", className = "", ...props }: GlassLinkProps) {
  return <Link {...props} className={`${styles.link} ${styles[emphasis]} ${className}`} />;
}
