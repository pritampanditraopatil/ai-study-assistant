"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL-REACTIVE CONTEXT
   The page passes a normalized scroll progress (0→1) via a global ref
   so the 3D scene can evolve as the user scrolls.
   ═══════════════════════════════════════════════════════════════════════════ */
const scrollProgressRef = { current: 0 };

// Called from the page component on scroll
export function setScrollProgress(v: number) {
  scrollProgressRef.current = v;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. Neural Core — Breathing icosahedron that expands with scroll
   ═══════════════════════════════════════════════════════════════════════════ */
function NeuralCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sp = scrollProgressRef.current;

    // Rotation speeds up slightly as user scrolls
    meshRef.current.rotation.y = t * (0.12 + sp * 0.08);
    meshRef.current.rotation.x = t * (0.06 + sp * 0.04);

    // Core breathes, and GROWS as user scrolls deeper (1.2 → 1.8)
    const baseScale = 1.2 + sp * 0.6;
    const breath = baseScale + Math.sin(t * 0.8) * 0.05 * baseScale;
    meshRef.current.scale.setScalar(breath);

    // Inner glow sphere follows but slightly larger
    glowRef.current.rotation.y = t * 0.05;
    glowRef.current.scale.setScalar(breath * 0.85);

    // Emissive intensifies with scroll
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 1.2 + sp * 1.5;
    mat.opacity = 0.7 + sp * 0.25;
  });

  return (
    <group>
      {/* Inner volumetric glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00F0FF"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#001a20"
          emissive="#00F0FF"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.8}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. Orbital Rings — widen and brighten on scroll
   ═══════════════════════════════════════════════════════════════════════════ */
interface OrbitalRingProps {
  baseRadius: number;
  tube: number;
  rotationAxis: [number, number, number];
  speed: number;
  initialRotation: [number, number, number];
  baseOpacity: number;
  color: string;
}

function OrbitalRing({
  baseRadius, tube, rotationAxis, speed, initialRotation, baseOpacity, color,
}: OrbitalRingProps) {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const sp = scrollProgressRef.current;

    ringRef.current.rotation.x = initialRotation[0] + t * rotationAxis[0];
    ringRef.current.rotation.y = initialRotation[1] + t * rotationAxis[1];
    ringRef.current.rotation.z = initialRotation[2] + t * rotationAxis[2];

    // Rings expand outward as user scrolls
    const scale = 1 + sp * 0.35;
    ringRef.current.scale.setScalar(scale);

    // Brighten on scroll
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = baseOpacity + sp * 0.2;
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[baseRadius, tube, 16, 100]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={baseOpacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbitalRings() {
  return (
    <>
      <OrbitalRing
        baseRadius={1.8} tube={0.005}
        rotationAxis={[0.3, 1, 0.1]} speed={0.2}
        initialRotation={[0.5, 0, 0]} baseOpacity={0.25} color="#00F0FF"
      />
      <OrbitalRing
        baseRadius={2.2} tube={0.004}
        rotationAxis={[0.1, 0.6, 0.5]} speed={0.15}
        initialRotation={[1.2, 0.3, 0.8]} baseOpacity={0.15} color="#FFFFFF"
      />
      <OrbitalRing
        baseRadius={2.7} tube={0.003}
        rotationAxis={[0.5, 0.2, 0.8]} speed={0.1}
        initialRotation={[0.8, 1.5, 0.2]} baseOpacity={0.1} color="#88DDFF"
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. Particle Field — particles spread outward on scroll
   ═══════════════════════════════════════════════════════════════════════════ */
function ParticleField() {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.5 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sp = scrollProgressRef.current;

    ref.current.rotation.y = t * 0.025;
    ref.current.rotation.x = t * 0.008;

    // Particles expand outward on scroll
    const scale = 1 + sp * 0.5;
    ref.current.scale.setScalar(scale);

    // Brighten
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.3 + sp * 0.3;
    mat.size = 0.015 + sp * 0.012;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00F0FF"
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. Connection Lines — fade in progressively with scroll
   ═══════════════════════════════════════════════════════════════════════════ */
function ConnectionLines() {
  const linesRef = useRef<THREE.LineSegments>(null!);

  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < 80; i++) {
      const r = 3 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      nodes.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }

    let count = 0;
    for (let i = 0; i < nodes.length && count < 50; i++) {
      for (let j = i + 1; j < nodes.length && count < 50; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < 1.8 && dist > 0.4) {
          vertices.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          );
          count++;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const sp = scrollProgressRef.current;
    linesRef.current.rotation.y = clock.getElapsedTime() * 0.015;

    // Lines fade in as user scrolls — invisible at top, fully visible at bottom
    const mat = linesRef.current.material as THREE.LineBasicMaterial;
    mat.opacity = sp * 0.15;

    // Lines also expand
    const scale = 1 + sp * 0.4;
    linesRef.current.scale.setScalar(scale);
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial
        color="#FFFFFF"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. Floating Nodes — appear progressively as user scrolls
   ═══════════════════════════════════════════════════════════════════════════ */
interface FloatingNodeProps {
  position: [number, number, number];
  radius: number;
  phaseOffset: number;
  index: number;
}

function FloatingNode({ position, radius, phaseOffset, index }: FloatingNodeProps) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sp = scrollProgressRef.current;

    // Each node appears at a different scroll threshold
    const threshold = index * 0.08;
    const nodeOpacity = Math.min(1, Math.max(0, (sp - threshold) * 5));

    const pulse = 1 + Math.sin(t * 1.5 + phaseOffset) * 0.4;
    ref.current.scale.setScalar(pulse * nodeOpacity);

    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.6 * nodeOpacity;
    mat.emissiveIntensity = 1.5 + sp * 2;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 8, 8]} />
      <meshStandardMaterial
        color="#003838"
        emissive="#00F0FF"
        emissiveIntensity={1.5}
        transparent
        opacity={0}
      />
    </mesh>
  );
}

function FloatingNodes() {
  const nodes = useMemo(() => {
    const result: { position: [number, number, number]; radius: number; phase: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const r = 1.5 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      result.push({
        position: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        radius: 0.03 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return result;
  }, []);

  return (
    <>
      {nodes.map((n, i) => (
        <FloatingNode
          key={i}
          position={n.position}
          radius={n.radius}
          phaseOffset={n.phase}
          index={i}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. Camera Rig — drifts closer on scroll (cinematic zoom)
   ═══════════════════════════════════════════════════════════════════════════ */
function CameraRig() {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime() * 0.025;
    const sp = scrollProgressRef.current;

    // Camera pulls in from distance 6 → 3.5 as user scrolls
    const radius = 6 - sp * 2.5;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    // Slight vertical drift
    camera.position.y = Math.sin(t * 0.5) * 0.3;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. Scroll-Driven Lighting — color temperature shifts
   ═══════════════════════════════════════════════════════════════════════════ */
function DynamicLighting() {
  const cyanLight = useRef<THREE.PointLight>(null!);
  const violetLight = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    const sp = scrollProgressRef.current;

    // Cyan core gets brighter on scroll
    cyanLight.current.intensity = 1.5 + sp * 3;
    cyanLight.current.distance = 6 + sp * 4;

    // Violet moves and intensifies
    violetLight.current.intensity = 0.5 + sp * 1.5;
    violetLight.current.position.y = -1 + sp * 2;
  });

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[3, 4, 2]} intensity={0.4} color="#8A2BE2" />
      <pointLight ref={cyanLight} position={[0, 0, 0]} intensity={1.5} distance={6} color="#00F0FF" />
      <pointLight ref={violetLight} position={[1.5, -1, 1]} intensity={0.5} distance={5} color="#8A2BE2" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Scene Assembly
   ═══════════════════════════════════════════════════════════════════════════ */
function SceneContents() {
  return (
    <>
      <DynamicLighting />
      <CameraRig />
      <NeuralCore />
      <OrbitalRings />
      <ParticleField />
      <ConnectionLines />
      <FloatingNodes />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Exported HeroScene wrapper
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HeroScene() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* R3F Canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 1.5]}
        >
          <SceneContents />
        </Canvas>
      </div>

      {/* Radial vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 25%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, transparent 50%, #000000 100%)",
        }}
      />
    </div>
  );
}
