"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { DAILY_REWARDS, rewardForLoginStreak } from "@/lib/rewards";
import { Gift, Zap, Snowflake, Sparkles, Lock, Check } from "lucide-react";
import { cn } from "@/lib/cn";

function rewardLabel(t: (k: string, v?: any) => string, r: ReturnType<typeof rewardForLoginStreak>) {
  if (r.kind === "xp") return t("daily.r.xp", { n: r.amount ?? 0 });
  if (r.kind === "freeze") return t("daily.r.freeze");
  if (r.day === 7) return t("daily.r.legendary");
  return t("daily.r.boost");
}

export function DailyRewardModal() {
  const t = useT();
  const cinematic = useGame((s) => s.cinematicReward);
  const claim = useGame((s) => s.claimDailyReward);
  const streak = useGame((s) => s.streak.current);
  const dismiss = useGame((s) => s.dismissCinematic);

  const open = !!cinematic;
  const todayReward = open ? rewardForLoginStreak(Math.max(1, streak)) : null;

  return (
    <AnimatePresence>
      {open && todayReward && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={() => dismiss("reward")}
          />
          <motion.div
            initial={{ y: 30, scale: 0.92, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-bg-card/95 p-6 shadow-glow"
          >
            <div className="pointer-events-none absolute -top-24 right-[-30px] h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-[-30px] h-56 w-56 rounded-full bg-brand-violet/30 blur-3xl" />

            <div className="relative flex flex-col items-center gap-2 text-center">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-glow-gold"
              >
                <Gift size={26} />
              </motion.div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300">
                {t("daily.eyebrow")}
              </div>
              <div className="font-display text-2xl font-semibold">
                {t("daily.title")}
              </div>
              <div className="text-xs text-ink-dim">
                {t("daily.day_of_cycle", { d: todayReward.day })}
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-7 gap-1.5">
              {DAILY_REWARDS.map((r) => {
                const claimedDay = r.day < todayReward.day;
                const isToday = r.day === todayReward.day;
                return (
                  <div
                    key={r.day}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-[9px] font-medium",
                      isToday
                        ? "border-amber-400/70 bg-amber-400/15 text-amber-300 shadow-glow-gold"
                        : claimedDay
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-white/5 bg-white/[0.03] text-ink-muted",
                    )}
                  >
                    {claimedDay ? (
                      <Check size={12} />
                    ) : isToday ? (
                      r.kind === "xp" ? <Zap size={12} /> : r.kind === "freeze" ? <Snowflake size={12} /> : <Sparkles size={12} />
                    ) : (
                      <Lock size={10} />
                    )}
                    <div className="leading-none">D{r.day}</div>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-5 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-brand-violet/10 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300">
                {t("daily.today_eyebrow")}
              </div>
              <div className="mt-1 font-display text-xl font-semibold text-white">
                {rewardLabel(t, todayReward)}
              </div>
            </div>

            <button
              onClick={claim}
              className="relative mt-5 w-full rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 py-3 text-sm font-semibold text-black transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {t("btn.claim")}
            </button>
            <button
              onClick={() => dismiss("reward")}
              className="relative mt-2 w-full py-2 text-xs text-ink-muted hover:text-ink-dim"
            >
              {t("btn.later")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
