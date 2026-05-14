"use client";
import * as Icons from "lucide-react";
import { Lock, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { Achievement } from "@/lib/types";
import { RARITY_META } from "@/lib/achievements";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n-hooks";

export function AchievementBadge({ a }: { a: Achievement }) {
  const t = useT();
  const meta = RARITY_META[a.rarity];
  const unlocked = !!a.unlockedAt;
  const Lucide = (Icons as any)[a.icon] ?? Trophy;
  const hidden = a.hidden && !unlocked;

  const title = hidden ? t("ach.hidden_locked") : t(`ach.${a.id}.title`);
  const desc = hidden ? t("ach.hidden_desc") : t(`ach.${a.id}.desc`);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-2xl border bg-bg-card/60 p-3 text-center backdrop-blur-xl transition-all",
        unlocked ? `border-white/10 ${meta.glow}` : "border-white/5 opacity-70",
      )}
    >
      <div
        className={cn(
          "grid h-14 w-14 place-items-center rounded-2xl ring-2",
          unlocked ? `${meta.ring} bg-white/5` : "ring-white/5 bg-white/[0.02]",
        )}
      >
        {hidden ? (
          <Lock className="h-6 w-6 text-ink-muted" />
        ) : (
          <Lucide
            className={cn("h-6 w-6", unlocked ? meta.color : "text-ink-muted")}
            strokeWidth={2}
          />
        )}
      </div>
      <div className={cn("text-[9px] uppercase tracking-[0.18em]", unlocked ? meta.color : "text-ink-muted")}>
        {t(`rarity.${a.rarity}`)}
      </div>
      <div className="text-xs font-semibold leading-tight text-white">{title}</div>
      <div className="text-[10px] leading-tight text-ink-dim">{desc}</div>
    </motion.div>
  );
}
