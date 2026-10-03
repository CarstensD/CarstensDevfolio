export const glassVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// A restrained refractive treatment of the studio-rendered artwork. Texture
// coordinates deform; light sweeps follow its highlights without moving the UI.
export const glassFragmentShader = /* glsl */ `
  uniform sampler2D uArtwork;
  uniform vec2 uViewport;
  uniform vec2 uImageSize;
  uniform vec2 uPointer;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float viewAspect = uViewport.x / uViewport.y;
    float imageAspect = uImageSize.x / uImageSize.y;
    vec2 uv = vUv;
    if (viewAspect > imageAspect) {
      uv.y = (uv.y - 0.5) * imageAspect / viewAspect + 0.5;
    } else {
      float cropCenter = viewAspect < 1.0 ? 0.72 : 0.5;
      uv.x = (uv.x - 0.5) * viewAspect / imageAspect + cropCenter;
    }

    float glassMask = smoothstep(0.28, 0.62, uv.x);
    float t = uTime * 0.24;
    vec2 flow = vec2(
      sin(uv.y * 6.0 + t) * 0.010 + sin(uv.x * 9.0 - t * 0.6) * 0.004,
      cos(uv.x * 5.0 + t * 0.7) * 0.010 + sin(uv.y * 8.0 + t) * 0.004
    );
    uv += (flow + uPointer * 0.007) * glassMask;
    uv = clamp(uv, 0.002, 0.998);
    vec3 base = texture2D(uArtwork, uv).rgb;

    float luminance = dot(base, vec3(0.2126, 0.7152, 0.0722));
    float highlightMask = smoothstep(0.08, 0.65, luminance) * glassMask;
    float lightPosition = 0.48 + sin(t * 0.75) * 0.32;
    float sweep = exp(-pow((uv.x + uv.y * 0.42 - lightPosition) * 4.0, 2.0));
    float warmSweep = exp(-pow((uv.y - 0.3 - cos(t * 0.55) * 0.22) * 6.0, 2.0));
    vec3 lighting = vec3(0.55, 0.72, 1.0) * sweep * 0.17
                  + vec3(1.0, 0.68, 0.38) * warmSweep * 0.045;
    vec3 color = base * (0.94 + sweep * 0.14) + lighting * highlightMask;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
