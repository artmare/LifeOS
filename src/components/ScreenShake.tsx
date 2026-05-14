"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { useGame } from "@/lib/store";

export function ScreenShake({ children }: { children: React.ReactNode }) {
  const key = useGame((s) => s.screenShakeKey);
  const controls = useAnimationControls();

  useEffect(() => {
    if (key === 0) return;
    controls.start({
      x: [0, -6, 6, -4, 4, -2, 2, 0],
      y: [0, 3, -3, 2, -2, 1, -1, 0],
      transition: { duration: 0.5, ease: "easeOut" },
    });
  }, [key, controls]);

  return <motion.div animate={controls}>{children}</motion.div>;
}
