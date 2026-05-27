"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import { GraduationCap, ArrowRight, Brain, Zap, MessageSquare } from "lucide-react";
import HeroSceneFallback from "@/components/HeroSceneFallback";
import { setScrollProgress } from "@/components/HeroScene";

const HeroScene = dynamic(() => import("@/components/HeroScene"), {
  ssr: false,
  loading: () => <HeroSceneFallback />,
});

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION SYSTEM — Choreographed entrance with pacing
   ═══════════════════════════════════════════════════════════════════════════ */

// Slow, cinematic stagger — gives each element room to breathe
const heroStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 1.0 },
  },
};

// Each hero element materializes from blur + distance
const heroItem = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.25, 0.1, 0, 1] as [number, number, number, number] },
  },
};

// Section reveals — slower, more editorial
const sectionReveal = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.4, ease: [0.25, 0.1, 0, 1] as [number, number, number, number] },
  },
};

const cardStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 1, ease: [0.25, 0.1, 0, 1] as [number, number, number, number] },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════════════════════════ */
const features = [
  {
    icon: <Brain size={20} />,
    label: "01",
    title: "Neural Mapping",
    desc: "Raw notes become living concept hierarchies. Every relationship, every dependency — mapped and navigable.",
    accent: "0,240,255",
  },
  {
    icon: <Zap size={20} />,
    label: "02",
    title: "Adaptive Recall",
    desc: "Flashcards that learn your forgetting curve. The system surfaces exactly what you're about to forget.",
    accent: "138,43,226",
  },
  {
    icon: <MessageSquare size={20} />,
    label: "03",
    title: "Socratic Dialogue",
    desc: "An AI that never gives you the answer first. It asks the right question until you find it yourself.",
    accent: "192,132,252",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Refs for scroll-driven sections
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-15%" });

  /* ─── Scroll progress for 3D scene ─────────────────────────────────────── */
  const { scrollY } = useScroll();

  // Hero parallax layers — different speeds create depth
  const heroSceneY = useTransform(scrollY, [0, 1000], [0, -200]);
  const heroSceneScale = useTransform(scrollY, [0, 1000], [1, 1.15]);
  const heroSceneOpacity = useTransform(scrollY, [0, 700], [1, 0]);
  const textY = useTransform(scrollY, [0, 800], [0, -100]);
  const textOpacity = useTransform(scrollY, [200, 700], [1, 0]);
  const badgeOpacity = useTransform(scrollY, [100, 400], [1, 0]);
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  // Pass scroll progress to 3D scene (0 at top → 1 at ~1000px)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const progress = Math.min(1, latest / 1000);
    setScrollProgress(progress);
  });

  // Divider line that draws itself on scroll
  const dividerWidth = useTransform(scrollY, [400, 900], ["0%", "100%"]);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const show3D = mounted && isDesktop && !prefersReducedMotion;

  /* ─── Magnetic buttons ─────────────────────────────────────────────────── */
  const handleMagnetic = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const resetMagnetic = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "translate(0, 0)";
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "#000000",
        color: "#ffffff",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ═══ ATMOSPHERIC BACKGROUND ═════════════════════════════════════════ */}
      <div className="bg-noise" style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />
      <div className="bg-grid" style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />
      <div className="bg-scanline" style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />

      {/* Central atmospheric glow — pulses */}
      <div
        className="hero-glow-pulse"
        style={{
          position: "fixed",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(100vw, 1000px)",
          height: "min(100vw, 1000px)",
          background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, rgba(138,43,226,0.03) 35%, transparent 65%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ═══ NAV ════════════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.1, 0, 1] }}
        style={{
          position: "fixed",
          top: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "calc(100% - 2rem)",
          maxWidth: "1100px",
          height: "50px",
          padding: "0 6px 0 20px",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "100px",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "24px", height: "24px", borderRadius: "50%",
              background: "#ffffff", color: "#000000",
            }}
          >
            <GraduationCap size={12} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "-0.01em", color: "rgba(255,255,255,0.8)" }}>
            Study Assistant
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <Link href="/upload"
            style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "8px 14px", borderRadius: "100px", transition: "color 300ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
          >
            Upload
          </Link>
          <Link href="/dashboard"
            style={{ fontSize: "12px", fontWeight: 500, color: "#000", textDecoration: "none", background: "#fff", padding: "7px 16px", borderRadius: "100px", transition: "opacity 200ms ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Dashboard
          </Link>
        </div>
      </motion.nav>

      {/* ═══ HERO — THE AWAKENING ═══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          minHeight: "700px",
          display: "flex",
          alignItems: "center",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* 3D Scene — parallax background layer */}
        <motion.div
          style={{
            position: "absolute",
            top: "-10%",
            bottom: "-10%",
            left: "15%",
            right: "-25%",
            zIndex: 1,
            opacity: heroSceneOpacity,
            y: heroSceneY,
            scale: heroSceneScale,
          }}
        >
          {show3D ? <HeroScene /> : <HeroSceneFallback />}
        </motion.div>

        {/* Cinematic Atmospheric Lighting System */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "65%", height: "100%",
            background: "linear-gradient(90deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 45%, transparent 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20%", left: "-10%",
            width: "50%", height: "60%",
            background: "radial-gradient(ellipse at center, rgba(138,43,226,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 2,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%", left: "10%",
            width: "40%", height: "40%",
            background: "radial-gradient(ellipse at center, rgba(0,240,255,0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
            zIndex: 2,
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />

        {/* ─── HERO TYPOGRAPHY ─────────────────────────────────────────────── */}
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="show"
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "left",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem",
          }}
        >
          <div style={{ maxWidth: "650px" }}>
          {/* Status chip — fades out first on scroll */}
          <motion.div
            variants={heroItem}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              background: "rgba(0,240,255,0.06)",
              border: "1px solid rgba(0,240,255,0.12)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "100px",
              color: "rgba(0,240,255,0.8)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              marginBottom: "3.5rem",
              opacity: badgeOpacity,
            }}
          >
            <span style={{
              width: "5px", height: "5px", borderRadius: "50%", background: "#00F0FF",
              boxShadow: "0 0 6px rgba(0,240,255,0.8)", display: "inline-block",
            }} />
            Neural Study Core · Active
          </motion.div>

          {/* ─── HEADLINE — The emotional centerpiece ───────────────────────── */}
          <motion.div variants={heroItem} style={{ marginBottom: "2.5rem", opacity: textOpacity, y: textY }}>
            {/* Line 1 — small, quiet, editorial */}
            <div
              style={{
                fontSize: "clamp(0.85rem, 1.2vw, 1.1rem)",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "1.25rem",
              }}
            >
              AI-Powered Learning
            </div>

            {/* Line 2 — the BIG statement */}
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(3.2rem, 7.5vw, 7.5rem)",
                fontWeight: 200,
                lineHeight: 0.95,
                letterSpacing: "-0.045em",
                margin: 0,
                padding: 0,
              }}
            >
              <span style={{ display: "block", color: "#ffffff" }}>
                Your mind,
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "1.15em",
                  lineHeight: 1,
                  marginTop: "-0.02em",
                  background: "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 60%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  paddingRight: "0.1em",
                }}
              >
                amplified.
              </span>
            </h1>
          </motion.div>

          {/* ─── SUBLINE — breathing room before body copy ──────────────────── */}
          <motion.p
            variants={heroItem}
            style={{
              fontSize: "clamp(0.95rem, 1.1vw + 0.3rem, 1.2rem)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.8,
              maxWidth: "520px",
              margin: "0 0 3.5rem",
              letterSpacing: "-0.005em",
              opacity: textOpacity,
            }}
          >
            Paste your lecture notes. The system transforms them into
            concept maps, adaptive flashcards, and a tutor that
            thinks with you — not for you.
          </motion.p>

          <motion.div
            variants={heroItem}
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              opacity: textOpacity,
            }}
          >
            <Link
              href="/dashboard"
              onMouseMove={handleMagnetic}
              onMouseLeave={resetMagnetic}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                height: "48px",
                padding: "0 28px",
                borderRadius: "100px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 4px 30px rgba(255,255,255,0.08)",
                transition: "box-shadow 500ms ease, transform 300ms cubic-bezier(0.25,0.1,0,1)",
                willChange: "transform",
              }}
            >
              Enter Dashboard
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/upload"
              onMouseMove={handleMagnetic}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "48px",
                padding: "0 28px",
                borderRadius: "100px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                fontWeight: 400,
                textDecoration: "none",
                transition: "border-color 400ms ease, color 400ms ease, transform 300ms cubic-bezier(0.25,0.1,0,1)",
                willChange: "transform",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.transform = "translate(0,0)";
              }}
            >
              Upload Notes
            </Link>
          </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.5 }}
          style={{
            position: "absolute",
            bottom: "2.5rem",
            right: "3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            zIndex: 10,
            opacity: scrollIndicatorOpacity,
          }}
        >
          <span style={{
            fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.15)", fontWeight: 500,
          }}>
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "1px",
              height: "28px",
              background: "linear-gradient(to bottom, rgba(0,240,255,0.3), transparent)",
            }}
          />
        </motion.div>

        {/* Bottom vignette */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: "50%",
            background: "linear-gradient(to bottom, transparent, #000000)",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      </section>

      {/* ═══ SCROLL DIVIDER — Animated line that draws itself ═══════════════ */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", height: "1px" }}>
          <motion.div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.2), rgba(138,43,226,0.15), transparent)",
              width: dividerWidth,
              margin: "0 auto",
            }}
          />
        </div>
      </div>

      {/* ═══ FEATURES — Editorial reveal ═══════════════════════════════════ */}
      <section
        ref={featuresRef}
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "10rem 1.5rem 12rem",
        }}
      >
        {/* Section intro — left-aligned editorial style */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15%" }}
          variants={sectionReveal}
          style={{ marginBottom: "6rem", maxWidth: "600px" }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase" as const,
              color: "rgba(0,240,255,0.5)",
              marginBottom: "2rem",
            }}
          >
            Core Architecture
          </p>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
              fontWeight: 200,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              marginBottom: "1.5rem",
            }}
          >
            Three systems.
            <br />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>One intelligence.</span>
          </h2>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 300,
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.7,
              maxWidth: "440px",
            }}
          >
            Each module operates independently but learns together —
            creating a feedback loop that accelerates your understanding.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "1fr",
            gap: "1px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={cardItem}
              style={{
                position: "relative",
                background: "rgba(0,0,0,0.5)",
                padding: "2.5rem 2rem 3rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                overflow: "hidden",
                transition: "background 600ms ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.5)";
              }}
            >
              {/* Number label */}
              <span style={{
                fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em",
                color: `rgba(${feat.accent},0.4)`,
              }}>
                {feat.label}
              </span>

              {/* Icon */}
              <div
                style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `rgba(${feat.accent},0.06)`,
                  border: `1px solid rgba(${feat.accent},0.1)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: `rgba(${feat.accent},0.7)`,
                }}
              >
                {feat.icon}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: "18px", fontWeight: 400, letterSpacing: "-0.015em",
                color: "rgba(255,255,255,0.9)",
              }}>
                {feat.title}
              </h3>

              {/* Desc */}
              <p style={{
                fontSize: "14px", color: "rgba(255,255,255,0.3)",
                lineHeight: 1.7, fontWeight: 300,
              }}>
                {feat.desc}
              </p>

              {/* Bottom accent line */}
              <div style={{
                position: "absolute",
                bottom: 0, left: "2rem", right: "2rem",
                height: "1px",
                background: `linear-gradient(90deg, rgba(${feat.accent},0.15), transparent)`,
              }} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ METRICS — Confident numbers ═══════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          borderTop: "1px solid rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          variants={cardStagger}
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "6rem 1.5rem",
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: "3rem",
          }}
        >
          {[
            { value: "10×", label: "Faster comprehension" },
            { value: "94%", label: "Concept retention" },
            { value: "∞", label: "Adaptive depth" },
            { value: "<2s", label: "Map generation" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={cardItem}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(2.2rem, 3.5vw, 4rem)",
                  fontWeight: 150,
                  letterSpacing: "-0.04em",
                  marginBottom: "0.75rem",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.25))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div style={{
                fontSize: "11px", color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.05em", textTransform: "uppercase" as const,
                fontWeight: 500,
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ CLOSING CTA — The invitation ═══════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          padding: "12rem 1.5rem 10rem",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0, 1] }}
        >
          <p style={{
            fontSize: "10px", fontWeight: 600, letterSpacing: "0.18em",
            textTransform: "uppercase" as const, color: "rgba(138,43,226,0.5)",
            marginBottom: "2.5rem",
          }}>
            Begin
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(2.8rem, 5.5vw, 5.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              marginBottom: "2rem",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.85)" }}>Ready to</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              think deeper?
            </span>
          </h2>
          <p style={{
            fontSize: "15px", color: "rgba(255,255,255,0.25)", fontWeight: 300,
            marginBottom: "3.5rem", lineHeight: 1.7, maxWidth: "400px", margin: "0 auto 3.5rem",
          }}>
            Upload your first set of notes.
            <br />
            The system takes it from there.
          </p>
          <Link
            href="/upload"
            onMouseMove={handleMagnetic}
            onMouseLeave={resetMagnetic}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              height: "52px",
              padding: "0 34px",
              borderRadius: "100px",
              background: "#ffffff",
              color: "#000000",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 4px 40px rgba(255,255,255,0.06)",
              transition: "box-shadow 500ms ease, transform 300ms cubic-bezier(0.25,0.1,0,1)",
              willChange: "transform",
            }}
          >
            Get Started
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        {/* Atmospheric glow */}
        <div
          className="hero-glow-pulse"
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px", height: "600px",
            background: "radial-gradient(circle, rgba(138,43,226,0.05), transparent 65%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.03)",
          padding: "3rem 1.5rem",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>
          AI Study Assistant
        </p>
      </footer>
    </div>
  );
}
