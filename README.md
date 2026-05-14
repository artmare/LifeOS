# LifeOS

> Your real life is the game.

Gamified self-improvement MVP — character, XP, quests, achievements, streaks, AI Coach.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (persisted to `localStorage`)
- OpenAI (with rule-based fallback) for AI Coach

## Getting started

```bash
npm install
cp .env.local.example .env.local   # optional, only needed for real LLM coach
npm run dev
```

Open http://localhost:3000.

## Environment

| Var              | Description                                              |
| ---------------- | -------------------------------------------------------- |
| `OPENAI_API_KEY` | If set, AI Coach calls OpenAI. If unset → rule-based.    |
| `OPENAI_MODEL`   | Defaults to `gpt-4o-mini`.                               |

## What's inside (MVP scope)

- **Onboarding**: name → avatar → class → focus stat
- **Character system**: 5 classes, 5 stats, level + lifetime XP
- **Quests**: daily rotation + epic; XP per difficulty
- **XP & Levels**: soft exponential curve
- **Achievements**: 5-tier rarity (common → mythic), popups, hidden ones
- **Streaks**: daily; auto-consumes streak-freezes; milestone toasts
- **AI Coach**: motivational mentor, context-aware (level/XP/streak/today)
- **Toast system**: XP gains, level-ups, streak milestones, achievement unlocks
- **Mobile-first UI**: dark, glassmorphism, shimmer, springy motion

## Not in MVP

By spec: banking, social PvP, guilds, marketplace, crypto, NFT, complex AI memory.

## File map

```
src/
  app/
    layout.tsx, page.tsx                # dashboard
    onboarding/page.tsx
    quests/page.tsx
    achievements/page.tsx
    coach/page.tsx
    api/coach/route.ts                  # OpenAI proxy + fallback
  components/
    NavShell, ToastLayer, HydrationGate
    CharacterCard, Avatar, StreakFlame
    QuestCard, AchievementBadge
    ui/Button, ui/Card, ui/Progress
  lib/
    store.ts        # Zustand + persist + all game actions
    achievements.ts # catalog + rarity meta
    quests.ts       # quest pool + daily generator
    xp.ts           # level math
    streak.ts logic # in store.pingActivity
    types.ts, cn.ts, date.ts
```

## Resetting your save

In a browser console: `localStorage.removeItem('lifeos:v1'); location.reload()`
or call `useGame.getState().resetAll()` from devtools.
