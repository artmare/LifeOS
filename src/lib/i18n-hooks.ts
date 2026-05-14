"use client";
import { useGame } from "./store";
import { tFor, type TFn } from "./i18n";
import type { Language } from "./types";

export function useT(): TFn {
  const lang = useGame((s) => s.language);
  return tFor(lang);
}

export function useLang(): Language {
  return useGame((s) => s.language);
}
