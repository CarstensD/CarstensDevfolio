"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GlassSceneController } from "./glass-scene";
import styles from "./GlassScene.module.css";

export function GlassScene({ imageUrl }: { imageUrl: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<GlassSceneController | null>(null);
  const paused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let generation = 0;
    let disposed = false;

    const initialize = async () => {
      const current = ++generation;
      controller.current?.dispose();
      controller.current = null;
      setReady(false);
      if (preference.matches) return;
      try {
        const { createGlassScene } = await import("./glass-scene");
        if (disposed || current !== generation) return;
        const scene = await createGlassScene(element, imageUrl, () => setReady(false));
        if (disposed || current !== generation) {
          scene.dispose();
          return;
        }
        controller.current = scene;
        scene.setPlaying(!paused.current);
        setReady(true);
      } catch (error) {
        // The still artwork remains visible when WebGL or the asset cannot load.
        console.warn("Liquid glass animation unavailable; showing still artwork.", error);
      }
    };

    void initialize();
    preference.addEventListener("change", initialize);
    return () => {
      disposed = true;
      generation++;
      preference.removeEventListener("change", initialize);
      controller.current?.dispose();
      controller.current = null;
    };
  }, [imageUrl]);

  const toggleMotion = () => {
    paused.current = !paused.current;
    setIsPaused(paused.current);
    controller.current?.setPlaying(!paused.current);
  };

  return (
    <>
      <div className={styles.scene} aria-hidden="true">
        <Image className={styles.poster} src={imageUrl} alt="" fill priority sizes="100vw" />
        <canvas ref={canvas} className={`${styles.canvas} ${ready ? styles.ready : ""}`} />
      </div>
      {ready && <button className={styles.motionButton} onClick={toggleMotion} aria-pressed={isPaused}>
        <span className={isPaused ? styles.playIcon : styles.pauseIcon} aria-hidden="true" />
        {isPaused ? "Resume motion" : "Pause motion"}
      </button>}
    </>
  );
}
