"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Swords, Trophy, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useGame } from "@/lib/store";
import { useT } from "@/lib/i18n-hooks";

const ITEMS: { href: string; key: string; icon: any }[] = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/quests", key: "nav.quests", icon: Swords },
  { href: "/achievements", key: "nav.awards", icon: Trophy },
  { href: "/coach", key: "nav.coach", icon: Sparkles },
  { href: "/settings", key: "nav.settings", icon: SettingsIcon },
];

export function NavShell() {
  const pathname = usePathname();
  const onboarded = useGame((s) => s.onboarded);
  const t = useT();
  if (!onboarded || pathname?.startsWith("/onboarding")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full px-3 pb-4">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-white/5 bg-bg-card/80 p-1.5 backdrop-blur-xl shadow-card">
        {ITEMS.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href} className="relative flex-1">
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[9px] font-medium transition-colors",
                  active ? "text-white" : "text-ink-muted hover:text-ink-dim",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-brand-violet/30 to-brand-indigo/20 ring-1 ring-brand-violet/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={18} strokeWidth={2.2} />
                <span className="truncate">{t(it.key)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
