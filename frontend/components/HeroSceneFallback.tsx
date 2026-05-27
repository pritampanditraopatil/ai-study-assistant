"use client";

import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// 1. Central Orb
// ---------------------------------------------------------------------------
function CentralOrb() {
  return (
    <motion.div
      style={{
        width: 300,
        height: 300,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(0,240,255,0.6) 0%, rgba(120,0,255,0.35) 45%, transparent 75%)",
        boxShadow:
          "0 0 80px 30px rgba(0,240,255,0.18), 0 0 160px 60px rgba(120,0,255,0.10)",
        position: "relative",
        zIndex: 3,
        willChange: "transform, opacity",
      }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [0.85, 1, 0.85],
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// 2. Concentric Rings
// ---------------------------------------------------------------------------
const RING_CONFIG = [
  { size: 200, opacity: 0.15, duration: 18 },
  { size: 320, opacity: 0.10, duration: 26 },
  { size: 440, opacity: 0.08, duration: 34 },
] as const;

function ConcentricRings() {
  return (
    <>
      {RING_CONFIG.map(({ size, opacity, duration }, i) => (
        <motion.div
          key={`ring-${i}`}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: "50%",
            border: `1px solid rgba(0,240,255,${opacity})`,
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
            zIndex: 2,
            willChange: "transform",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// 3. Grid Lines
// ---------------------------------------------------------------------------
interface GridLineProps {
  orientation: "horizontal" | "vertical";
  offset: string;
}

const GRID_LINES: GridLineProps[] = [
  { orientation: "horizontal", offset: "22%" },
  { orientation: "horizontal", offset: "50%" },
  { orientation: "horizontal", offset: "78%" },
  { orientation: "vertical", offset: "25%" },
  { orientation: "vertical", offset: "50%" },
  { orientation: "vertical", offset: "75%" },
];

function GridLines() {
  return (
    <>
      {GRID_LINES.map(({ orientation, offset }, i) => {
        const isH = orientation === "horizontal";
        return (
          <div
            key={`grid-${i}`}
            style={{
              position: "absolute",
              ...(isH
                ? {
                    top: offset,
                    left: 0,
                    width: "100%",
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
                  }
                : {
                    left: offset,
                    top: 0,
                    height: "100%",
                    width: 1,
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
                  }),
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// 4. Floating Dots
// ---------------------------------------------------------------------------
interface DotConfig {
  x: string;
  y: string;
  size: number;
  color: string;
  glow: string;
  delay: number;
  durationY: number;
  driftY: number;
}

const DOT_CONFIGS: DotConfig[] = [
  { x: "15%", y: "20%", size: 5, color: "#00f0ff", glow: "0 0 8px 2px rgba(0,240,255,0.6)", delay: 0, durationY: 5, driftY: 14 },
  { x: "80%", y: "30%", size: 4, color: "#7b2fff", glow: "0 0 8px 2px rgba(123,47,255,0.6)", delay: 0.8, durationY: 6, driftY: 18 },
  { x: "70%", y: "75%", size: 6, color: "#00f0ff", glow: "0 0 10px 3px rgba(0,240,255,0.5)", delay: 1.5, durationY: 7, driftY: 12 },
  { x: "25%", y: "72%", size: 4, color: "#7b2fff", glow: "0 0 8px 2px rgba(123,47,255,0.5)", delay: 2.2, durationY: 5.5, driftY: 16 },
  { x: "50%", y: "12%", size: 5, color: "#00f0ff", glow: "0 0 8px 2px rgba(0,240,255,0.55)", delay: 0.4, durationY: 8, driftY: 20 },
  { x: "88%", y: "55%", size: 4, color: "#7b2fff", glow: "0 0 8px 2px rgba(123,47,255,0.55)", delay: 3, durationY: 6.5, driftY: 14 },
  { x: "10%", y: "48%", size: 5, color: "#00f0ff", glow: "0 0 10px 3px rgba(0,240,255,0.5)", delay: 1, durationY: 7.5, driftY: 18 },
  { x: "60%", y: "88%", size: 4, color: "#7b2fff", glow: "0 0 8px 2px rgba(123,47,255,0.5)", delay: 2.6, durationY: 5, driftY: 10 },
];

function FloatingDots() {
  return (
    <>
      {DOT_CONFIGS.map((dot, i) => (
        <motion.div
          key={`dot-${i}`}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            backgroundColor: dot.color,
            boxShadow: dot.glow,
            zIndex: 4,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -dot.driftY, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: dot.durationY,
            ease: "easeInOut",
            repeat: Infinity,
            delay: dot.delay,
          }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// 5. Scan Line
// ---------------------------------------------------------------------------
function ScanLine() {
  return (
    <motion.div
      style={{
        position: "absolute",
        left: 0,
        width: "100%",
        height: 1,
        background:
          "linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.12) 50%, transparent 100%)",
        opacity: 0.05,
        zIndex: 5,
        pointerEvents: "none",
        willChange: "top",
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{
        duration: 8,
        ease: "linear",
        repeat: Infinity,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// 6. Vignette
// ---------------------------------------------------------------------------
function Vignette() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)",
        zIndex: 6,
        pointerEvents: "none",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Fallback Component
// ---------------------------------------------------------------------------
export default function HeroSceneFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 50% 50%, #0a0e1a 0%, #050508 100%)",
      }}
    >
      <GridLines />
      <ConcentricRings />
      <CentralOrb />
      <FloatingDots />
      <ScanLine />
      <Vignette />
    </div>
  );
}
