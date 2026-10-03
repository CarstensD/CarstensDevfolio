import * as THREE from "three";
import { glassFragmentShader, glassVertexShader } from "./glass-shaders";

export interface GlassSceneController {
  setPlaying(playing: boolean): void;
  dispose(): void;
}

export async function createGlassScene(
  canvas: HTMLCanvasElement,
  imageUrl: string,
  onContextLost: () => void,
): Promise<GlassSceneController> {
  const texture = await new THREE.TextureLoader().loadAsync(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: "low-power" });
  } catch (error) {
    texture.dispose();
    throw error;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const geometry = new THREE.PlaneGeometry(2, 2);
  const pointer = new THREE.Vector2();
  const image = texture.image as HTMLImageElement;
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uArtwork: { value: texture },
      uViewport: { value: new THREE.Vector2(1, 1) },
      uImageSize: { value: new THREE.Vector2(image.width, image.height) },
      uPointer: { value: new THREE.Vector2() },
      uTime: { value: 0 },
    },
    vertexShader: glassVertexShader,
    fragmentShader: glassFragmentShader,
    depthTest: false,
    depthWrite: false,
  });
  scene.add(new THREE.Mesh(geometry, material));

  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let playing = false;
  let inView = true;
  let disposed = false;
  let contextLost = false;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const frameInterval = window.matchMedia("(max-width: 767px)").matches ? 1000 / 30 : 1000 / 45;

  const canAnimate = () => playing && inView && !document.hidden && !disposed && !contextLost;
  const render = (now: number) => {
    frame = 0;
    if (!canAnimate()) return;
    if (!lastTime || now - lastTime >= frameInterval) {
      elapsed += lastTime ? Math.min((now - lastTime) / 1000, 0.08) : 0;
      lastTime = now;
      material.uniforms.uTime.value = elapsed;
      material.uniforms.uPointer.value.lerp(pointer, 0.035);
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(render);
  };

  const synchronize = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (canAnimate()) frame = requestAnimationFrame(render);
  };

  const resize = () => {
    if (disposed || contextLost) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    // Bound the pixel budget for mobile/high-DPI screens.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5, Math.sqrt(2_000_000 / (width * height))));
    renderer.setSize(width, height, false);
    material.uniforms.uViewport.value.set(width, height);
    renderer.render(scene, camera);
  };

  const movePointer = (event: PointerEvent) => {
    if (!finePointer.matches || !inView) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5),
      THREE.MathUtils.clamp(0.5 - (event.clientY - bounds.top) / bounds.height, -0.5, 0.5),
    );
  };
  const resetPointer = () => pointer.set(0, 0);
  const loseContext = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    synchronize();
    onContextLost();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    synchronize();
  });
  intersection.observe(canvas);
  document.addEventListener("visibilitychange", synchronize);
  window.addEventListener("pointermove", movePointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  canvas.addEventListener("webglcontextlost", loseContext);
  resize();

  return {
    setPlaying(value) { playing = value; synchronize(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      synchronize();
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", synchronize);
      window.removeEventListener("pointermove", movePointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      canvas.removeEventListener("webglcontextlost", loseContext);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };
}
