"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/cn";
import type { CharacterClass, StatKey } from "@/lib/types";
import { Sword, Brain, Leaf, Wand2, Compass, ArrowRight, ArrowLeft, Shuffle } from "lucide-react";

const CLASSES: { id: CharacterClass; icon: any; focus: StatKey }[] = [
  { id: "warrior", icon: Sword, focus: "strength" },
  { id: "sage", icon: Brain, focus: "mind" },
  { id: "monk", icon: Leaf, focus: "soul" },
  { id: "creator", icon: Wand2, focus: "mind" },
  { id: "explorer", icon: Compass, focus: "social" },
];

const FOCUS: StatKey[] = ["discipline", "strength", "mind", "soul", "social"];

export default function OnboardingPage() {
  const t = useT();
  const router = useRouter();
  const onboarded = useGame((s) => s.onboarded);
  const complete = useGame((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [cls, setCls] = useState<CharacterClass | null>(null);
  const [focus, setFocus] = useState<StatKey | null>(null);
  const [avatarSeed, setAvatarSeed] = useState(() => Math.random().toString(36).slice(2));

  useEffect(() => {
    if (onboarded) router.replace("/");
  }, [onboarded, router]);

  const total = 4;

  function next() {
    if (step < total - 1) setStep((s) => s + 1);
    else finish();
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    if (!name.trim() || !cls || !focus) return;
    complete({ name: name.trim(), cls, avatarSeed, focusStat: focus });
    router.replace("/");
  }

  const canNext =
    step === 0 ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && cls !== null) ||
    (step === 3 && focus !== null);

  return (
    <div className="flex min-h-[80dvh] flex-col gap-6 pt-2">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-gradient-to-r from-brand-violet to-brand-cyan" : "bg-white/5",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="flex flex-1 flex-col gap-6"
        >
          {step === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-ink-muted">
                {t("onb.welcome.eyebrow")}
              </div>
              <h1 className="heading text-4xl">
                <span className="shimmer-text">{t("onb.welcome.line")}</span>
              </h1>
              <p className="max-w-sm text-sm text-ink-dim">{t("onb.welcome.body")}</p>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="heading text-2xl">{t("onb.name.title")}</h2>
              <p className="text-sm text-ink-dim">{t("onb.name.body")}</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("onb.name.placeholder")}
                className="rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-3 text-lg outline-none placeholder:text-ink-muted focus:border-brand-violet/60"
              />
              <div className="mt-4 flex items-center gap-4">
                <Avatar seed={avatarSeed} initial={name || "?"} size={84} />
                <button
                  onClick={() => setAvatarSeed(Math.random().toString(36).slice(2))}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:border-brand-violet/40"
                >
                  <Shuffle size={14} /> {t("btn.reroll")}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="heading text-2xl">{t("onb.class.title")}</h2>
              <p className="text-sm text-ink-dim">{t("onb.class.body")}</p>
              <div className="grid grid-cols-1 gap-2">
                {CLASSES.map((c) => {
                  const Icon = c.icon;
                  const active = cls === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCls(c.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border bg-bg-card/60 p-3 text-left transition-all",
                        active
                          ? "border-brand-violet/60 shadow-glow"
                          : "border-white/5 hover:border-white/15",
                      )}
                    >
                      <div
                        className={cn(
                          "grid h-11 w-11 place-items-center rounded-xl",
                          active ? "bg-brand-violet/20 text-brand-violet" : "bg-white/5 text-ink-dim",
                        )}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{t(`class.${c.id}.name`)}</div>
                        <div className="text-xs text-ink-dim">{t(`class.${c.id}.line`)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-1 flex-col gap-4">
              <h2 className="heading text-2xl">{t("onb.focus.title")}</h2>
              <p className="text-sm text-ink-dim">{t("onb.focus.body")}</p>
              <div className="grid grid-cols-1 gap-2">
                {FOCUS.map((f) => {
                  const active = focus === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFocus(f)}
                      className={cn(
                        "rounded-2xl border bg-bg-card/60 p-3 text-left transition-all",
                        active ? "border-brand-cyan/60 shadow-glow-cyan" : "border-white/5 hover:border-white/15",
                      )}
                    >
                      <div className="font-semibold">{t(`focus.${f}.name`)}</div>
                      <div className="text-xs text-ink-dim">{t(`focus.${f}.line`)}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 0}
          className={cn(step === 0 && "invisible")}
        >
          <ArrowLeft size={16} /> {t("btn.back")}
        </Button>
        <Button variant="primary" onClick={next} disabled={!canNext}>
          {step < total - 1 ? t("btn.continue") : t("btn.begin")} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
