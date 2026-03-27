"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TerrainSettings } from "@/app/page";

// ── Color palette generators ──────────────────────────────────────────────────

function createTopographicCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0.0, "#0d1b2a");
  grad.addColorStop(0.1, "#1a3a4a");
  grad.addColorStop(0.2, "#1e5a6a");
  grad.addColorStop(0.35, "#2d7a5e");
  grad.addColorStop(0.5, "#4a9a3a");
  grad.addColorStop(0.62, "#8ab840");
  grad.addColorStop(0.72, "#c8a050");
  grad.addColorStop(0.82, "#a06030");
  grad.addColorStop(0.92, "#705030");
  grad.addColorStop(1.0, "#f0f0f0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);
  return canvas;
}

function createHeatmapCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0.0, "#0f0c29");
  grad.addColorStop(0.2, "#302b63");
  grad.addColorStop(0.4, "#24243e");
  grad.addColorStop(0.5, "#0d3b8c");
  grad.addColorStop(0.6, "#0080ff");
  grad.addColorStop(0.7, "#00e5ff");
  grad.addColorStop(0.8, "#ffeb3b");
  grad.addColorStop(0.9, "#ff5722");
  grad.addColorStop(1.0, "#ffffff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);
  return canvas;
}

function createArcticCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0.0, "#0a1628");
  grad.addColorStop(0.15, "#0e2a4d");
  grad.addColorStop(0.3, "#134d8c");
  grad.addColorStop(0.45, "#1a7fc4");
  grad.addColorStop(0.6, "#7ecbde");
  grad.addColorStop(0.75, "#c8e8f0");
  grad.addColorStop(0.88, "#e8f4f8");
  grad.addColorStop(1.0, "#ffffff");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, 1);
  return canvas;
}

// ── Terrain Mesh ──────────────────────────────────────────────────────────────

interface TerrainMeshProps {
  heightmapUrl: string;
  settings: TerrainSettings;
}

function TerrainMesh({ heightmapUrl, settings }: TerrainMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  // Load heightmap texture
  const heightTexture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(heightmapUrl);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [heightmapUrl]);

  // Color ramp texture
  const colorTexture = useMemo(() => {
    let canvas: HTMLCanvasElement;
    switch (settings.colorMode) {
      case "heatmap":    canvas = createHeatmapCanvas(); break;
      case "arctic":     canvas = createArcticCanvas(); break;
      case "grayscale":  {
        const c = document.createElement("canvas");
        c.width = 2; c.height = 1;
        const ctx = c.getContext("2d")!;
        const g = ctx.createLinearGradient(0, 0, 2, 0);
        g.addColorStop(0, "#111111");
        g.addColorStop(1, "#ffffff");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 2, 1);
        canvas = c;
        break;
      }
      default:           canvas = createTopographicCanvas();
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [settings.colorMode]);

  // Custom shader material for vertex displacement + color lookup
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uHeightmap: { value: heightTexture },
        uColorRamp: { value: colorTexture },
        uDisplacement: { value: settings.displacementScale },
        uWireframe: { value: settings.wireframe ? 1.0 : 0.0 },
        uFlatShading: { value: settings.flatShading ? 1.0 : 0.0 },
        uAmbient: { value: settings.ambientIntensity },
        uLightDir: { value: new THREE.Vector3(1, 2, 1).normalize() },
        uTime: { value: 0 },
      },
      vertexShader: `
        uniform sampler2D uHeightmap;
        uniform float uDisplacement;
        varying vec2 vUv;
        varying float vHeight;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          float h = texture2D(uHeightmap, uv).r;
          vHeight = h;
          vec3 displaced = position + normal * h * uDisplacement;
          vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
          vWorldPos = worldPos.xyz;
          vWorldNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uColorRamp;
        uniform float uWireframe;
        uniform float uAmbient;
        uniform vec3 uLightDir;
        varying vec2 vUv;
        varying float vHeight;
        varying vec3 vWorldNormal;

        void main() {
          // Sample color from ramp
          vec3 terrainColor = texture2D(uColorRamp, vec2(vHeight, 0.5)).rgb;

          // Diffuse lighting
          float diff = max(dot(normalize(vWorldNormal), normalize(uLightDir)), 0.0);
          float lighting = uAmbient + (1.0 - uAmbient) * diff;

          // Subtle height-based fog
          vec3 finalColor = terrainColor * lighting;

          // Contour lines
          float contourFreq = 10.0;
          float contour = abs(fract(vHeight * contourFreq) - 0.5);
          float line = smoothstep(0.02, 0.05, contour);
          finalColor = mix(finalColor * 0.6, finalColor, line);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      wireframe: settings.wireframe,
      side: THREE.DoubleSide,
    });
  }, [heightTexture, colorTexture, settings.displacementScale, settings.wireframe, settings.ambientIntensity, settings.flatShading]);

  // Update uniforms when settings change
  useEffect(() => {
    if (material) {
      material.uniforms.uDisplacement.value = settings.displacementScale;
      material.uniforms.uAmbient.value = settings.ambientIntensity;
      material.wireframe = settings.wireframe;
    }
  }, [material, settings]);

  // Auto-rotate
  useFrame((_, delta) => {
    if (meshRef.current && settings.autoRotate) {
      meshRef.current.rotation.z += delta * 0.15;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      100, 100,
      settings.resolution - 1,
      settings.resolution - 1
    );
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [settings.resolution]);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} receiveShadow castShadow />
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({ imageUrl, settings }: { imageUrl: string; settings: TerrainSettings }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={settings.ambientIntensity * 0.8} color="#7ecbde" />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1.4}
        color="#ffeedd"
        castShadow
      />
      <directionalLight position={[-30, 20, -50]} intensity={0.3} color="#4488cc" />
      <hemisphereLight args={["#1a2a4a", "#0a1020", 0.4]} />

      {/* Terrain */}
      <TerrainMesh heightmapUrl={imageUrl} settings={settings} />

      {/* Fog */}
      {settings.fog && <fogExp2 attach="fog" args={["#0a1020", 0.008]} />}

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        maxPolarAngle={Math.PI * 0.85}
        minDistance={20}
        maxDistance={220}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ── Main Viewer ───────────────────────────────────────────────────────────────

interface TerrainViewerProps {
  imageUrl: string;
  settings: TerrainSettings;
}

export default function TerrainViewer({ imageUrl, settings }: TerrainViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 60, 100], fov: 55, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: false }}
      shadows
      style={{ background: "hsl(220, 20%, 5%)" }}
    >
      <color attach="background" args={["#0a0e18"]} />
      <Scene imageUrl={imageUrl} settings={settings} />
    </Canvas>
  );
}