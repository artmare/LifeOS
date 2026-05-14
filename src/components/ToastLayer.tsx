"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useGame, type ToastItem } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import type { TFn } from "@/lib/i18n";
import { RARITY_META } from "@/lib/achievements";
import * as Icons from "lucide-react";
import { Trophy, Zap, Flame, ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

export function ToastLayer() {
  const queue = useGame((s) => s.toastQueue);
  const dismiss = useGame((s) => s.dismissToast);
  const t = useT();

  useEffect(() => {
    const timers = queue.map((toast) => {
      const ttl =
        toast.kind === "xp"
          ? 1600
          : toast.kind === "achievement" || toast.kind === "levelup"
          ? 4200
          : toast.kind === "tier"
          ? 4500
          : 3000;
      return setTimeout(() => dismiss(toast.id), ttl);
    });
    return () => timers.forEach(clearTimeout);
  }, [queue, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-3">
      <AnimatePresence>
        {queue.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => dismiss(toast.id)} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose, t }: { toast: ToastItem; onClose: () => void; t: TFn }) {
  if (toast.kind === "achievement") {
    const meta = RARITY_META[toast.achievement.rarity];
    const Lucide = (Icons as any)[toast.achievement.icon] ?? Trophy;
    return (
      <motion.button
        onClick={onClose}
        initial={{ y: -40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className={cn(
          "pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-white/10 bg-bg-card/95 px-4 py-3 text-left backdrop-blur-xl",
          meta.glow,
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04]" />
        <div className="relative flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-2",
              meta.ring,
              "bg-white/5",
            )}
          >
            <Lucide className={cn("h-6 w-6", meta.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn("text-[10px] uppercase tracking-[0.18em]", meta.color)}>
              {t("toast.achievement.label_unlocked", { rarity: t(`rarity.${toast.achievement.rarity}`) })}
            </div>
            <div className="truncate text-base font-semibold text-white">
              {t(`ach.${toast.achievement.id}.title`)}
            </div>
            <div className="truncate text-xs text-ink-dim">
              {t(`ach.${toast.achievement.id}.desc`)}
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  if (toast.kind === "levelup") {
    return (
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        onClick={onClose}
        className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-500/20 via-bg-card/95 to-brand-violet/20 px-4 py-4 backdrop-blur-xl shadow-glow-gold"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/20 ring-2 ring-amber-300/60">
            <ArrowUp className="h-6 w-6 text-amber-300" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
              {t("toast.levelup.label")}
            </div>
            <div className="text-lg font-semibold text-white">
              {t("toast.levelup.reached", { n: toast.level })}
            </div>
            <div className="text-xs text-ink-dim">{t("toast.levelup.body")}</div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (toast.kind === "streak") {
    return (
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0 }}
        onClick={onClose}
        className="pointer-events-auto w-full rounded-2xl border border-rose-400/30 bg-bg-card/95 px-4 py-3 backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(244,63,94,0.7)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 ring-2 ring-rose-400/50">
            <Flame className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-rose-400">
              {t("toast.streak.label")}
            </div>
            <div className="text-base font-semibold text-white">
              {t("toast.streak.days", { n: toast.days })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (toast.kind === "tier") {
    return (
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0 }}
        onClick={onClose}
        className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 via-bg-card/95 to-brand-cyan/15 px-4 py-3 backdrop-blur-xl shadow-[0_0_40px_-6px_rgba(236,72,153,0.9)]"
      >
        <div className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-300">
          {t("toast.tier.label")}
        </div>
        <div className="font-display text-lg font-semibold text-white">
          {t("toast.tier.youare", { tier: t(`tier.${toast.tier}.title`) })}
        </div>
      </motion.div>
    );
  }

  // xp
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      onClick={onClose}
      className="pointer-events-auto flex items-center gap-2 rounded-full border border-brand-violet/30 bg-bg-card/90 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-xl shadow-glow"
    >
      <Zap className="h-4 w-4 text-brand-cyan" />
      +{toast.amount} XP
      {toast.combo && toast.combo >= 2 && (
        <span className="text-xs text-amber-300">×{toast.combo}</span>
      )}
    </motion.div>
  );
}
