export const GLASS_FRAGMENT_SHADER = `
precision mediump float;

uniform vec3 iResolution;
uniform sampler2D iChannel0;
uniform vec3 iGlassTint;
uniform vec3 iGlassAccent;
uniform float iPurpleFringe;

float frostNoise(vec2 coordinate) {
  return fract(sin(dot(coordinate, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 p = uv - 0.5;

  float radial = dot(p, p);
  vec2 lens = 0.5 + p * (0.88 + radial * 0.18);

  vec2 edgeDirection = vec2(
    1.0 - smoothstep(0.0, 0.16, uv.x),
    1.0 - smoothstep(0.0, 0.24, uv.y)
  );
  edgeDirection -= vec2(
    1.0 - smoothstep(0.0, 0.16, 1.0 - uv.x),
    1.0 - smoothstep(0.0, 0.24, 1.0 - uv.y)
  );
  float nearestEdge = min(
    min(uv.x, 1.0 - uv.x),
    min(uv.y, 1.0 - uv.y)
  );
  float rim = 1.0 - smoothstep(0.0, 0.18, nearestEdge);
  lens += edgeDirection * 0.045;
  lens += vec2(
    sin(uv.y * 9.0 + uv.x * 3.0),
    cos(uv.x * 8.0 - uv.y * 4.0)
  ) * rim * 0.0035;

  vec4 color = vec4(0.0);
  float total = 0.0;
  for (float x = -3.0; x <= 3.0; x++) {
    for (float y = -3.0; y <= 3.0; y++) {
      vec2 offset = vec2(x, y) * 2.4 / iResolution.xy;
      color += texture2D(iChannel0, clamp(lens + offset, 0.001, 0.999));
      total += 1.0;
    }
  }
  color /= total;

  // Keep the colour split to a consistent two device pixels. A UV-sized
  // offset grows into a wide, jagged fringe on lower-density displays.
  vec2 chroma = edgeDirection * rim * (2.0 / iResolution.xy);
  color.r = texture2D(iChannel0, clamp(lens + chroma, 0.001, 0.999)).r;
  color.b = texture2D(iChannel0, clamp(lens - chroma, 0.001, 0.999)).b;

  float channelSpread = max(max(color.r, color.g), color.b) - min(min(color.r, color.g), color.b);
  float fringeStrength = smoothstep(0.015, 0.65, channelSpread);

  float topLeftGlow = 1.0 - smoothstep(
    0.0,
    0.9,
    length((uv - vec2(0.08, 0.9)) * vec2(0.7, 1.5))
  );
  float bottomRightGlow = 1.0 - smoothstep(
    0.0,
    0.72,
    length((uv - vec2(0.92, 0.08)) * vec2(0.75, 1.7))
  );

  float fineFrost = frostNoise(gl_FragCoord.xy) - 0.5;
  float cloudyFrost = frostNoise(floor(gl_FragCoord.xy * 0.16)) - 0.5;
  float milk = 0.055 + topLeftGlow * 0.09 + bottomRightGlow * 0.045;
  color.rgb = (color.rgb - 0.5) * 1.04 + 0.5;
  color.rgb = mix(color.rgb, iGlassTint, milk);
  color.rgb += iGlassAccent * bottomRightGlow * 0.025;
  color.rgb += vec3(fineFrost * 0.018 + cloudyFrost * 0.012);
  float monochrome = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 developerFringe = mix(vec3(monochrome), iGlassAccent, fringeStrength * 0.9);
  color.rgb = mix(color.rgb, developerFringe, iPurpleFringe);
  color.a = 1.0;
  gl_FragColor = color;
}
`;
