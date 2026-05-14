"use client";
import { useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { motion } from "framer-motion";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useGame((s) => s.hydrated);
  const ensureDailyQuests = useGame((s) => s.ensureDailyQuests);
  const onboarded = useGame((s) => s.onboarded);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hydrated && onboarded) ensureDailyQuests();
  }, [hydrated, onboarded, ensureDailyQuests]);

  if (!mounted || !hydrated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="h-12 w-12 rounded-full border-2 border-white/10 border-t-brand-violet"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
      </div>
    );
  }
  return <>{children}</>;
}
