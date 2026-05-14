import "./globals.css";
import type { Metadata, Viewport } from "next";
import { NavShell } from "@/components/NavShell";
import { ToastLayer } from "@/components/ToastLayer";
import { HydrationGate } from "@/components/HydrationGate";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { AchievementCinematic } from "@/components/AchievementCinematic";
import { DailyRewardModal } from "@/components/DailyRewardModal";
import { FloatingXpLayer } from "@/components/FloatingXp";
import { ScreenShake } from "@/components/ScreenShake";

export const metadata: Metadata = {
  title: "LifeOS — Operating system for human evolution",
  description: "I am becoming stronger.",
};

export const viewport: Viewport = {
  themeColor: "#08080c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="relative min-h-dvh font-sans">
        <HydrationGate>
          <ScreenShake>
            <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-4 pb-28 pt-6 sm:max-w-2xl">
              {children}
            </div>
          </ScreenShake>
          <NavShell />
          <ToastLayer />
          <FloatingXpLayer />
          <LevelUpOverlay />
          <AchievementCinematic />
          <DailyRewardModal />
        </HydrationGate>
      </body>
    </html>
  );
}
