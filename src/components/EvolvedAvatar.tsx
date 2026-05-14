"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { TierMeta } from "@/lib/evolution";
import { useMemo } from "react";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function EvolvedAvatar({
  seed,
  initial,
  tier,
  size = 96,
  className,
  showParticles = true,
}: {
  seed: string;
  initial: string;
  tier: TierMeta;
  size?: number;
  className?: string;
  showParticles?: boolean;
}) {
  const h = hash(seed || "x");
  const rot = `${h % 360}deg`;
  const [a, b, c] = tier.auraColors;

  // particle positions
  const particles = useMemo(() => {
    const count = tier.id === "broken" ? 0 : tier.id === "initiate" ? 4 : tier.id === "disciplined" ? 6 : tier.id === "ascending" ? 8 : tier.id === "elite" ? 10 : 14;
    return Array.from({ length: count }).map((_, i) => ({
      angle: (i / count) * Math.PI * 2,
      r: size * 0.55 + (h % 7) + i * 1.4,
      delay: (i * 0.25) % 2.5,
      dur: 3 + (i % 3),
    }));
  }, [tier.id, size, h]);

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size + 28, height: size + 28 }}
    >
      {/* outer aura ring */}
      <motion.div
        className={cn("absolute inset-0 rounded-full", tier.glow)}
        style={{
          background: `conic-gradient(from ${rot}, ${a}, ${b}, ${c}, ${a})`,
          filter: "blur(14px)",
          opacity: tier.id === "broken" ? 0.25 : 0.55,
        }}
        animate={{ rotate: tier.id === "broken" ? 0 : 360 }}
        transition={{ repeat: Infinity, duration: tier.id === "mythic" ? 14 : 22, ease: "linear" }}
      />

      {/* second pulsing ring for high tiers */}
      {(tier.id === "elite" || tier.id === "mythic" || tier.id === "ascending") && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size + 16,
            height: size + 16,
            border: `1px solid ${tier.ringColor}`,
            boxShadow: `0 0 30px ${tier.ringColor}`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        />
      )}

      {/* particles */}
      {showParticles && particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{
            background: tier.particleColor,
            boxShadow: `0 0 6px ${tier.particleColor}`,
            top: `calc(50% + ${Math.sin(p.angle) * p.r}px)`,
            left: `calc(50% + ${Math.cos(p.angle) * p.r}px)`,
          }}
          animate={{
            y: [0, -6, 0],
            opacity: [0.2, 1, 0.2],
            scale: [0.6, 1.2, 0.6],
          }}
          transition={{ repeat: Infinity, duration: p.dur, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* solid gradient ring (border) */}
      <div
        className="relative grid place-items-center rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(from ${rot}, ${a}, ${b}, ${c}, ${a})`,
        }}
      >
        <div
          className="grid place-items-center rounded-full bg-bg-soft/85 backdrop-blur-sm"
          style={{ width: size - 6, height: size - 6 }}
        >
          <span className="font-display text-2xl font-semibold tracking-tight text-white">
            {initial.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
