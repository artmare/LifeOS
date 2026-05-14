"use client";
import { useGame } from "@/lib/store";
import { QuestCard } from "@/components/QuestCard";
import { AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n-hooks";

export default function QuestsPage() {
  const t = useT();
  const quests = useGame((s) => s.quests);
  const todo = quests.filter((q) => !q.completedAt);
  const done = quests.filter((q) => q.completedAt);

  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2">
        <div className="text-xs uppercase tracking-[0.25em] text-ink-muted">
          {t("quests.eyebrow")}
        </div>
        <h1 className="heading text-3xl">{t("quests.title")}</h1>
        <p className="text-sm text-ink-dim">{t("quests.subtitle")}</p>
      </header>

      <section>
        <h2 className="heading mb-2 text-sm uppercase tracking-[0.2em] text-ink-dim">
          {t("quests.active")} · {todo.length}
        </h2>
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {todo.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </AnimatePresence>
          {todo.length === 0 && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
              {t("quests.empty")}
            </div>
          )}
        </div>
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="heading mb-2 text-sm uppercase tracking-[0.2em] text-ink-dim">
            {t("quests.completed")} · {done.length}
          </h2>
          <div className="flex flex-col gap-2">
            {done.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
