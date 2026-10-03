import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createRibbonGeometry } from "./ribbon-geometry";

export interface GlassSceneController {
  setPlaying(playing: boolean): void;
  downloadStill(): Promise<void>;
  dispose(): void;
}

export function createGlassScene(
  canvas: HTMLCanvasElement,
  onContextLost: () => void,
): GlassSceneController {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: "low-power" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#06090d");
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  const ribbon = createRibbonGeometry(mobile ? 128 : 256, mobile ? 12 : 24);
  const material = new THREE.MeshPhysicalMaterial({
    color: "#596a7e", metalness: 1, roughness: 0.11,
    clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.6,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(ribbon.geometry, material);
  scene.add(mesh);
  const blue = new THREE.PointLight("#b9dcff", 95, 30, 2);
  const amber = new THREE.PointLight("#ffc18a", 60, 30, 2);
  const key = new THREE.DirectionalLight("#ffffff", 4);
  key.position.set(-2, 4, 6);
  scene.add(blue, amber, key);
  const pointer = new THREE.Vector2();
  const smoothedPointer = new THREE.Vector2();
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const frameInterval = 1000 / (mobile ? 30 : 45);
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let playing = false;
  let inView = true;
  let disposed = false;
  let contextLost = false;
  let exporting = false;

  const pose = () => {
    ribbon.update(elapsed);
    mesh.rotation.set(0.15 + Math.sin(elapsed * 0.23) * 0.18 + smoothedPointer.y * 0.2,
      -0.35 + Math.sin(elapsed * 0.19) * 0.28 + smoothedPointer.x * 0.25,
      -0.52 + Math.sin(elapsed * 0.16) * 0.13);
    blue.position.set(Math.sin(elapsed * 0.55) * 5, 3, 4 + Math.cos(elapsed * 0.4) * 2);
    amber.position.set(4, Math.cos(elapsed * 0.38) * 4, 3);
    scene.environmentRotation.y = elapsed * 0.12;
  };
  const canAnimate = () => playing && inView && !document.hidden && !disposed && !contextLost && !exporting;
  const render = (now: number) => {
    frame = 0;
    if (!canAnimate()) return;
    if (!lastTime || now - lastTime >= frameInterval) {
      elapsed += lastTime ? Math.min((now - lastTime) / 1000, 0.08) : 0;
      lastTime = now;
      smoothedPointer.lerp(pointer, 0.045);
      pose();
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
  const frameCamera = (width: number, height: number) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    mesh.position.x = mobile ? 0.55 : halfHeight * camera.aspect * 0.48;
    mesh.scale.setScalar(mobile ? 0.85 : 1.15);
  };
  const resize = () => {
    if (disposed || contextLost || exporting) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const pixels = mobile ? 2_000_000 : 8_300_000;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2, Math.sqrt(pixels / (width * height))));
    renderer.setSize(width, height, false);
    frameCamera(width, height);
    pose();
    renderer.render(scene, camera);
  };
  const movePointer = (event: PointerEvent) => {
    if (!finePointer.matches || !inView) return;
    const bounds = canvas.getBoundingClientRect();
    pointer.set(THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width - 0.5, -0.5, 0.5),
      THREE.MathUtils.clamp(0.5 - (event.clientY - bounds.top) / bounds.height, -0.5, 0.5));
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
  const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; synchronize(); });
  intersection.observe(canvas);
  document.addEventListener("visibilitychange", synchronize);
  window.addEventListener("pointermove", movePointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  canvas.addEventListener("webglcontextlost", loseContext);
  resize();

  return {
    setPlaying(value) { playing = value; synchronize(); },
    async downloadStill() {
      if (disposed || contextLost || exporting) return;
      exporting = true;
      synchronize();
      const output = document.createElement("canvas");
      output.width = 7680;
      output.height = 4320;
      const context = output.getContext("2d");
      const exportRibbon = createRibbonGeometry(1024, 48);
      exportRibbon.update(elapsed);
      mesh.geometry = exportRibbon.geometry;
      try {
        if (!context) throw new Error("Unable to create export canvas.");
        // Tile the native 8K render to avoid the device's renderbuffer size limit.
        const tile = Math.min(2048, renderer.capabilities.maxTextureSize);
        renderer.setPixelRatio(1);
        frameCamera(output.width, output.height);
        for (let y = 0; y < output.height; y += tile) {
          for (let x = 0; x < output.width; x += tile) {
            if (disposed || contextLost) throw new Error("Ribbon renderer is no longer available.");
            const width = Math.min(tile, output.width - x);
            const height = Math.min(tile, output.height - y);
            camera.setViewOffset(output.width, output.height, x, y, width, height);
            renderer.setSize(width, height, false);
            renderer.render(scene, camera);
            context.drawImage(canvas, x, y);
          }
        }
        const blob = await new Promise<Blob>((resolve, reject) => output.toBlob(
          (value) => value ? resolve(value) : reject(new Error("Unable to encode artwork.")), "image/png"));
        if (disposed) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "carstens-ribbon-8k.png";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } finally {
        output.width = 0;
        output.height = 0;
        mesh.geometry = ribbon.geometry;
        exportRibbon.geometry.dispose();
        camera.clearViewOffset();
        exporting = false;
        resize();
        synchronize();
      }
    },
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
      ribbon.geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
