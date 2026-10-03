"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { GlassLink } from "@/components/ui/GlassLink";
import { site } from "@/content/site";
import { GlassScene } from "./GlassScene";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-hero-reveal]", {
        opacity: 0, y: 22, duration: 1.1, stagger: 0.12, ease: "power3.out", clearProps: "all",
      });
    }, section);
    return () => motion.revert();
  }, []);

  return (
    <section className={styles.hero} ref={section} aria-labelledby="hero-title">
      <GlassScene imageUrl={site.hero.artwork} />
      <div className={styles.content}>
        <p className={styles.eyebrow} data-hero-reveal>{site.name}</p>
        <h1 id="hero-title" className={styles.title}>
          {site.hero.headline.map((line) => <span key={line} data-hero-reveal>{line}</span>)}
        </h1>
        <p className={styles.description} data-hero-reveal>{site.hero.description}</p>
        <div className={styles.actions} data-hero-reveal>
          <GlassLink href="/projects" emphasis="primary">Explore my work</GlassLink>
          <GlassLink href="/contact">Get in touch</GlassLink>
        </div>
      </div>
    </section>
  );
}
