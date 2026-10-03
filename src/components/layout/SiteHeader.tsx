"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/content/site";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const dismissOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const close = () => setMenuOpen(false);
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismissOutside);
    desktop.addEventListener("change", close);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismissOutside);
      desktop.removeEventListener("change", close);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header} ref={header}>
      <Link href="/" aria-label={`${site.name} — home`} className={styles.brand} onClick={() => setMenuOpen(false)}>
        {site.initials}
      </Link>
      <button ref={menuButton} className={styles.menuButton} aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>
        <span className={menuOpen ? styles.closeIcon : styles.menuIcon} aria-hidden="true" />
      </button>
      <nav id="site-navigation" aria-label="Main navigation" className={`${styles.navigation} ${menuOpen ? styles.open : ""}`}>
        {navigation.map((item) => (
          <Link key={item.label} href={item.href} aria-current={pathname === item.href ? "page" : undefined}
            target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
            onClick={() => setMenuOpen(false)}>
            {item.label}{item.external && <span className="sr-only"> (opens in a new tab)</span>}
          </Link>
        ))}
      </nav>
      <span className={styles.location}>{site.location}</span>
    </header>
  );
}
