"use client";
import { motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { Battery, BatteryLow, BatteryFull, BatteryWarning } from "lucide-react";
import { useEffect } from "react";

export function EnergyBar() {
  const t = useT();
  const energy = useGame((s) => s.energy);
  const recover = useGame((s) => s.recoverEnergy);

  useEffect(() => {
    const tm = setInterval(() => recover(), 60_000);
    return () => clearInterval(tm);
  }, [recover]);

  const v = energy.value;
  const tone =
    v < 25 ? { c: "text-rose-400", bg: "from-rose-500 to-red-600", icon: BatteryWarning, label: t("energy.low") }
      : v < 60 ? { c: "text-amber-300", bg: "from-amber-400 to-orange-500", icon: BatteryLow, label: t("energy.steady") }
      : v < 85 ? { c: "text-cyan-300", bg: "from-cyan-400 to-brand-indigo", icon: Battery, label: t("energy.focused") }
      : { c: "text-emerald-300", bg: "from-emerald-400 to-cyan-400", icon: BatteryFull, label: t("energy.peak") };
  const Icon = tone.icon;

  return (
    <div className="rounded-2xl border border-white/5 bg-bg-card/70 p-3 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`grid h-7 w-7 place-items-center rounded-lg bg-white/5 ${tone.c}`}>
            <Icon size={15} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-ink-muted">{t("energy.eyebrow")}</div>
            <div className="text-xs font-semibold">{tone.label}</div>
          </div>
        </div>
        <div className="text-xs font-semibold tabular-nums text-ink-dim">{v}%</div>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className={`h-full rounded-full bg-gradient-to-r ${tone.bg}`}
        />
      </div>
    </div>
  );
}
