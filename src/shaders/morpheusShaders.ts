export const uniforms = /* glsl */ `
  uniform float uTime;
  uniform float uWaveSpeed;
  uniform float uDisplacementRotationSpeed;
  uniform float uTangentFactor;
  uniform float uPoleFallOffPoint;
  uniform bool uUseReverseParabolic;

  varying vec2 vUv;
`;

export const methods = /* glsl */ `
  // Custom parabolic smoothstep function
  float parabolicStep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0); // Normalize to [0, 1]
    return t * t; 
  }

  // Custom reverse parabolic smoothstep function
  float reverseParabolicStep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0); // Normalize to [0, 1]
    return 1.0 - (1.0 - t) * (1.0 - t); 
  }

  float customSmoothstep(float value, float x) {
    value = clamp(abs(value), 0.0, 1.0);

    if (value < x) {
      return 0.0;
    }

    if (uUseReverseParabolic) {
      return reverseParabolicStep(x, 1.0, value);
    }

    return parabolicStep(x, 1.0, value);
  }


  vec3 calculatePositionDisplacement(vec3 position, float PI) {
    vec3 sphereCenter = vec3(0.0);
    vec3 direction = normalize(position);
    float radius = .6;
    float peak = length(position - sphereCenter);

    // Angle bounds
    float angleStart = 0.4;
    float angleEnd = .0;

    float effectAngle = atan(position.z, position.x);

    // Normalize effectAngle to be in the range [0, 1]
    float normalizedEffectAngle = (effectAngle + PI) / (2.0 * PI);

    float timeOffset = mod(uTime * uDisplacementRotationSpeed, 1.0);
    float movingEffectAngle = mod(normalizedEffectAngle - timeOffset, 1.0);

    float smoothAngle = 0.5 - 0.5 * cos(2.0 * PI * movingEffectAngle);

    float poleFactor = (1. - customSmoothstep(direction.y, uPoleFallOffPoint));
    float angleMask = 1.0 - smoothstep(angleEnd, angleStart, smoothAngle);
    float influence = 1.0 - angleMask * poleFactor;

    float surfaceDistortion = (cnoise(position + uTime * uWaveSpeed)) * 0.05;
    float spikesDistortion = voronoi(2.0 * position, 0.2, uTime * uWaveSpeed) * 0.2;

    // Calculate new displaced position
    vec3 displacement = direction * (peak + spikesDistortion);
    // Calculate morphing effect
    vec3 morph = direction * (radius + surfaceDistortion);

    return mix(displacement, morph, influence);
  }

  vec3 orthogonal(vec3 v) {
    return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
  }

  vec3 computeNormal(vec3 position, vec3 displacedPosition, float PI) {

    vec3 tangent1 = orthogonal(normal);
    vec3 tangent2 = normalize(cross(normal, tangent1));

    vec3 nearby1 = position + tangent1 * uTangentFactor;
    vec3 nearby2 = position + tangent2 * uTangentFactor;

    vec3 distorted1 = calculatePositionDisplacement(nearby1, PI);
    vec3 distorted2 = calculatePositionDisplacement(nearby2, PI);

    return normalize(cross(distorted1 - displacedPosition, distorted2 - displacedPosition));

  }
`;
