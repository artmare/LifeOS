"use client";
import { useState, useMemo } from "react";
import { useGame } from "@/lib/store";
import { AchievementBadge } from "@/components/AchievementBadge";
import { RARITY_META } from "@/lib/achievements";
import type { Rarity } from "@/lib/types";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Trophy } from "lucide-react";
import { useT } from "@/lib/i18n-hooks";

const ORDER: Rarity[] = ["mythic", "legendary", "epic", "rare", "common"];

type Filter = "all" | "unlocked" | "locked";

export default function AchievementsPage() {
  const t = useT();
  const achievements = useGame((s) => s.achievements);
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => {
    const unlocked = achievements.filter((a) => a.unlockedAt).length;
    const byRarity: Record<Rarity, { total: number; unlocked: number }> = {
      common: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 },
      mythic: { total: 0, unlocked: 0 },
    };
    for (const a of achievements) {
      byRarity[a.rarity].total++;
      if (a.unlockedAt) byRarity[a.rarity].unlocked++;
    }
    return { unlocked, total: achievements.length, byRarity };
  }, [achievements]);

  const filtered = useMemo(() => {
    if (filter === "unlocked") return achievements.filter((a) => a.unlockedAt);
    if (filter === "locked") return achievements.filter((a) => !a.unlockedAt);
    return achievements;
  }, [achievements, filter]);

  const showcase = useMemo(() => {
    const rarityOrder: Record<Rarity, number> = { mythic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
    return [...achievements]
      .filter((a) => a.unlockedAt)
      .sort((a, b) => {
        const r = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (r !== 0) return r;
        return (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0);
      })
      .slice(0, 3);
  }, [achievements]);

  const completion = Math.round((stats.unlocked / stats.total) * 100);

  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2">
        <div className="text-xs uppercase tracking-[0.25em] text-ink-muted">
          {t("awards.eyebrow")}
        </div>
        <h1 className="heading text-3xl">
          <span className="shimmer-text">{t("awards.title")}</span>
        </h1>
        <p className="text-sm text-ink-dim">
          {t("awards.subtitle", { u: stats.unlocked, t: stats.total, p: completion })}
        </p>
      </header>

      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-ink-dim">
          <span>{t("awards.progress")}</span>
          <span className="tabular-nums">{completion}%</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
            className="h-full bg-gradient-to-r from-brand-violet via-brand-cyan to-amber-300"
          />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {ORDER.slice().reverse().map((r) => {
            const meta = RARITY_META[r];
            const s = stats.byRarity[r];
            return (
              <div
                key={r}
                className={`flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.02] px-1 py-1.5 text-[9px] ${meta.color}`}
              >
                <span className="uppercase tracking-widest">{t(`rarity.${r}`).slice(0, 3)}</span>
                <span className="font-semibold tabular-nums text-white">
                  {s.unlocked}/{s.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showcase.length > 0 && (
        <section>
          <h2 className="mb-2 text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            {t("awards.showcase")}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {showcase.map((a, i) => {
              const meta = RARITY_META[a.rarity];
              const Lucide = (Icons as any)[a.icon] ?? Trophy;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-bg-card/70 p-3 backdrop-blur-xl ${meta.glow}`}
                >
                  <motion.div
                    animate={{ rotate: [0, 4, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 6 }}
                    className={`relative grid h-14 w-14 place-items-center rounded-2xl ring-2 ${meta.ring} bg-white/5`}
                  >
                    <Lucide className={`h-7 w-7 ${meta.color}`} strokeWidth={1.8} />
                  </motion.div>
                  <div className={`relative text-[9px] uppercase tracking-[0.18em] ${meta.color}`}>
                    {t(`rarity.${a.rarity}`)}
                  </div>
                  <div className="relative truncate text-[11px] font-semibold text-white">
                    {t(`ach.${a.id}.title`)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex gap-1.5">
        {(["all", "unlocked", "locked"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-brand-violet/20 text-white ring-1 ring-brand-violet/50"
                : "bg-white/5 text-ink-dim hover:text-white"
            }`}
          >
            {t(`awards.filter.${f}`)}
          </button>
        ))}
      </div>

      {ORDER.map((r) => {
        const items = filtered.filter((a) => a.rarity === r);
        if (items.length === 0) return null;
        const meta = RARITY_META[r];
        return (
          <section key={r}>
            <h2 className={`mb-2 text-xs uppercase tracking-[0.22em] ${meta.color}`}>
              {t(`rarity.${r}`)} · {items.filter((a) => a.unlockedAt).length}/{items.length}
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((a) => (
                <AchievementBadge key={a.id} a={a} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
