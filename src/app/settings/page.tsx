"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { LANGUAGES } from "@/lib/i18n";
import { tierFor } from "@/lib/evolution";
import { levelFromXp } from "@/lib/xp";
import { sfx } from "@/lib/sound";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/cn";
import { Check, Volume2, VolumeX, Vibrate, AlertTriangle, Globe } from "lucide-react";

export default function SettingsPage() {
  const t = useT();
  const router = useRouter();

  const language = useGame((s) => s.language);
  const setLanguage = useGame((s) => s.setLanguage);
  const soundOn = useGame((s) => s.soundOn);
  const setSound = useGame((s) => s.setSound);
  const hapticsOn = useGame((s) => s.hapticsOn);
  const setHaptics = useGame((s) => s.setHaptics);
  const resetAll = useGame((s) => s.resetAll);
  const character = useGame((s) => s.character);
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streak.current);
  const prestige = useGame((s) => s.prestige.level);

  const [confirmReset, setConfirmReset] = useState(false);

  const level = levelFromXp(xp);
  const tier = character ? tierFor(level, streak, prestige) : null;

  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2">
        <div className="text-xs uppercase tracking-[0.25em] text-ink-muted">
          {t("settings.eyebrow")}
        </div>
        <h1 className="heading text-3xl">
          <span className="shimmer-text">{t("settings.title")}</span>
        </h1>
      </header>

      {/* Character preview */}
      {character && tier && (
        <div className="card flex items-center gap-3 p-3">
          <div
            className="h-12 w-12 shrink-0 rounded-full"
            style={{
              background: `conic-gradient(${tier.auraColors[0]}, ${tier.auraColors[1]}, ${tier.auraColors[2]}, ${tier.auraColors[0]})`,
            }}
          >
            <div className="m-[3px] grid h-[42px] w-[42px] place-items-center rounded-full bg-bg-soft text-sm font-semibold text-white">
              {character.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-[10px] uppercase tracking-[0.22em] ${tier.textColor}`}>
              {t("settings.character")} · {t(`tier.${tier.id}.title`)}
            </div>
            <div className="truncate font-display text-base font-semibold">
              {character.name}
            </div>
            <div className="text-[10px] text-ink-dim tabular-nums">
              {t("settings.character.level")} {level} · {xp.toLocaleString()} XP
            </div>
          </div>
        </div>
      )}

      {/* Language section */}
      <section>
        <SectionHead icon={<Globe size={14} />} title={t("settings.language")} body={t("settings.language.body")} />
        <div className="flex flex-col gap-2">
          {LANGUAGES.map((l) => {
            const active = language === l.id;
            return (
              <motion.button
                key={l.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setLanguage(l.id);
                  if (soundOn) sfx.tap();
                  if (hapticsOn) haptics.tap();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  active
                    ? "border-brand-violet/60 bg-brand-violet/10 shadow-glow"
                    : "border-white/5 bg-bg-card/60 hover:border-white/15",
                )}
              >
                <span className="text-2xl leading-none">{l.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{l.nativeName}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">
                    {t(`lang.${l.id}`)}
                  </div>
                </div>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="grid h-7 w-7 place-items-center rounded-full bg-brand-violet text-white"
                    >
                      <Check size={14} strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Sound */}
      <section>
        <SectionHead
          icon={soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          title={t("settings.sound")}
          body={t("settings.sound.body")}
        />
        <Toggle
          on={soundOn}
          onChange={(v) => {
            setSound(v);
            if (v) sfx.tap();
          }}
        />
      </section>

      {/* Haptics */}
      <section>
        <SectionHead icon={<Vibrate size={14} />} title={t("settings.haptics")} body={t("settings.haptics.body")} />
        <Toggle
          on={hapticsOn}
          onChange={(v) => {
            setHaptics(v);
            if (v) haptics.tap();
          }}
        />
      </section>

      {/* Danger zone */}
      <section>
        <SectionHead
          icon={<AlertTriangle size={14} />}
          title={t("settings.danger")}
          body={t("settings.reset.body")}
          tone="danger"
        />
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            {t("btn.reset")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-medium text-ink hover:bg-white/10"
            >
              {t("btn.cancel")}
            </button>
            <button
              onClick={() => {
                resetAll();
                router.replace("/onboarding");
              }}
              className="flex-1 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-3 text-sm font-semibold text-white shadow-[0_0_30px_-10px_rgba(244,63,94,0.8)]"
            >
              {t("btn.confirm_reset")}
            </button>
          </div>
        )}
      </section>

      <div className="pt-2 text-center text-[10px] text-ink-muted">
        LifeOS · v0.3 · local-first
      </div>
    </div>
  );
}

function SectionHead({
  icon,
  title,
  body,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: "danger";
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "grid h-6 w-6 place-items-center rounded-md",
            tone === "danger" ? "bg-rose-500/15 text-rose-300" : "bg-white/5 text-ink-dim",
          )}
        >
          {icon}
        </div>
        <h2 className={cn("text-sm font-semibold", tone === "danger" ? "text-rose-300" : "text-white")}>
          {title}
        </h2>
      </div>
      <p className="mt-1 pl-8 text-xs text-ink-dim">{body}</p>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-8 w-14 rounded-full border transition-colors",
        on ? "border-brand-violet/60 bg-gradient-to-r from-brand-violet to-brand-indigo shadow-glow" : "border-white/10 bg-white/5",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-[3px] grid h-[22px] w-[22px] place-items-center rounded-full bg-white shadow",
          on ? "left-[28px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
