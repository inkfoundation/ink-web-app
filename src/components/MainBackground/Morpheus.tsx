import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";

import { methods, uniforms } from "@/shaders/morpheusShaders";
import { noise } from "@/shaders/noise";

export interface MorpheusUniforms {
  uTime: number;
  uWaveSpeed: number;
  uDisplacementRotationSpeed: number;
  uTangentFactor: number;
  uPoleFallOffPoint: number;
  uUseReverseParabolic: boolean;
}

const DEFAULT_UNIFORM_VALUES = {
  uTime: 0,
  uWaveSpeed: 0.5,
  uDisplacementRotationSpeed: 0.15,
  uTangentFactor: 0.01,
  uPoleFallOffPoint: 0.6,
  uUseReverseParabolic: false,
};

export class MorpheusMeshMaterial extends THREE.MeshPhysicalMaterial {
  static key: string;

  constructor(parameters: THREE.MeshPhysicalMaterialParameters) {
    super(parameters);

    this.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: DEFAULT_UNIFORM_VALUES.uTime };
      shader.uniforms.uWaveSpeed = { value: DEFAULT_UNIFORM_VALUES.uWaveSpeed };
      shader.uniforms.uDisplacementRotationSpeed = {
        value: DEFAULT_UNIFORM_VALUES.uDisplacementRotationSpeed,
      };
      shader.uniforms.uTangentFactor = {
        value: DEFAULT_UNIFORM_VALUES.uTangentFactor,
      };
      shader.uniforms.uPoleFallOffPoint = {
        value: DEFAULT_UNIFORM_VALUES.uPoleFallOffPoint,
      };
      shader.uniforms.uUseReverseParabolic = {
        value: DEFAULT_UNIFORM_VALUES.uUseReverseParabolic,
      };

      this.userData.shader = shader;

      const vertexShader = /* glsl */ `
        #include <begin_vertex>
        vUv = uv;
        vec3 newPosition = calculatePositionDisplacement(position, PI);
        vNormal = computeNormal(position, newPosition, PI);
        transformed = newPosition ;
      `;

      shader.vertexShader = `
        ${uniforms}
        ${noise}
        ${methods}
        ${shader.vertexShader.replace("#include <begin_vertex>", vertexShader)}
      `;
    };
  }

  updateUniforms(uniforms: Partial<MorpheusUniforms>) {
    if (this.userData.shader) {
      Object.entries(uniforms).forEach(([key, value]) => {
        this.userData.shader.uniforms[key].value = value;
      });
    }
  }

  // Careful, this happens everyframe
  incrementTime(deltaTime: number) {
    if (this.userData.shader) {
      this.userData.shader.uniforms.uTime.value += deltaTime;
    }
  }
}

MorpheusMeshMaterial.key = THREE.MathUtils.generateUUID();

extend({ MorpheusMeshMaterial });

export const Morpheus: React.FC = () => {
  const { nodes } = useGLTF("/Morpheus.glb");
  const materialRef = useRef<MorpheusMeshMaterial>(null);

  useControls(
    "Morpheus",
    {
      uWaveSpeed: {
        value: DEFAULT_UNIFORM_VALUES.uWaveSpeed,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (uWaveSpeed) => {
          materialRef.current?.updateUniforms({ uWaveSpeed });
        },
      },
      uDisplacementRotationSpeed: {
        value: DEFAULT_UNIFORM_VALUES.uDisplacementRotationSpeed,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (uDisplacementRotationSpeed) => {
          materialRef.current?.updateUniforms({ uDisplacementRotationSpeed });
        },
      },
      uTangentFactor: {
        value: DEFAULT_UNIFORM_VALUES.uTangentFactor,
        min: 0.00001,
        max: 0.2,
        onChange: (uTangentFactor) => {
          materialRef.current?.updateUniforms({ uTangentFactor });
        },
      },
      uPoleFallOffPoint: {
        value: DEFAULT_UNIFORM_VALUES.uPoleFallOffPoint,
        min: 0,
        max: 1,
        onChange: (uPoleFallOffPoint) => {
          materialRef.current?.updateUniforms({ uPoleFallOffPoint });
        },
      },
      uUseReverseParabolic: {
        value: DEFAULT_UNIFORM_VALUES.uUseReverseParabolic,
        onChange: (uUseReverseParabolic) => {
          materialRef.current?.updateUniforms({ uUseReverseParabolic });
        },
      },
    },
    { collapsed: true }
  );

  const {
    color,
    thickness,
    ior,
    specularIntensity,
    specularColor,
    roughness,
    metalness,
    wireframe,
    sheen,
    sheenColor,
    clearCoat,
    clearCoatRoughness,
  } = useControls(
    "MeshPhysicalMaterial",
    {
      color: { value: "#110827" },
      thickness: { value: 0.1 },
      ior: { value: 1.5, min: 1, max: 2.333 },
      specularIntensity: { value: 1, min: 0, max: 1 },
      specularColor: { value: "#EDE5F0" },
      sheen: { value: 1, min: 0, max: 1 },
      sheenColor: { value: "#2b1463" },
      roughness: { value: 0.06, min: 0, max: 1 },
      metalness: { value: 0.0, min: 0, max: 1 },
      clearCoat: { value: 0.8, min: 0, max: 1 },
      clearCoatRoughness: { value: 0.0, min: 0, max: 1 },
      wireframe: { value: false },
    },
    { collapsed: true }
  );

  useFrame((state, deltaTime) => {
    if (materialRef.current) {
      materialRef.current.incrementTime(deltaTime);
    }
  });

  return (
    <mesh
      geometry={(nodes.MorphedSphere as THREE.Mesh).geometry}
      normalMatrix={(nodes.MorphedSphere as THREE.Mesh).normalMatrix}
      scale={3}
    >
      <morpheusMeshMaterial
        key={MorpheusMeshMaterial.key}
        ref={materialRef}
        color={color}
        thickness={thickness}
        ior={ior}
        specularIntensity={specularIntensity}
        specularColor={specularColor}
        roughness={roughness}
        metalness={metalness}
        wireframe={wireframe}
        sheen={sheen}
        sheenColor={sheenColor}
        clearcoatRoughness={clearCoatRoughness}
        clearcoat={clearCoat}
        toneMapped={false}
        attach="material"
      />
    </mesh>
  );
};
