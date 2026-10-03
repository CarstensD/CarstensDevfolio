import * as THREE from "three";

// A closed, flattened tube follows a flowing loop. Rebuilding its surface also
// updates normals, so reflections follow the deformation rather than a texture.
export function createRibbonGeometry(segments: number, sides = 24) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * (sides + 1) * 3);
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j;
      const b = a + sides + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  const center = new THREE.Vector3();
  const next = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const up = new THREE.Vector3(0, 0, 1);

  const point = (angle: number, time: number, target: THREE.Vector3) => {
    const breathing = Math.sin(angle * 3 + time * 0.45) * 0.18;
    return target.set(
      (2.65 + Math.cos(angle * 3) * 0.7 + breathing) * Math.cos(angle * 2),
      (1.9 + Math.cos(angle * 3) * 0.55 + breathing) * Math.sin(angle * 2),
      Math.sin(angle * 3 + time * 0.24) * 1.05,
    );
  };

  const update = (time: number) => {
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      point(angle, time, center);
      point(angle + 0.001, time, next);
      tangent.subVectors(next, center).normalize();
      normal.crossVectors(tangent, up).normalize();
      binormal.crossVectors(tangent, normal).normalize();
      const twist = angle * 2 + Math.sin(angle * 3 - time * 0.3) * 0.5;
      const width = 0.48 + Math.sin(angle * 2 + time * 0.32) * 0.12;
      for (let j = 0; j <= sides; j++) {
        const cross = (j / sides) * Math.PI * 2;
        const broad = Math.cos(cross) * width;
        const thin = Math.sin(cross) * 0.085;
        const x = broad * Math.cos(twist) - thin * Math.sin(twist);
        const y = broad * Math.sin(twist) + thin * Math.cos(twist);
        const index = (i * (sides + 1) + j) * 3;
        positions[index] = center.x + normal.x * x + binormal.x * y;
        positions[index + 1] = center.y + normal.y * x + binormal.y * y;
        positions[index + 2] = center.z + normal.z * x + binormal.z * y;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  };
  update(0);
  return { geometry, update };
}
