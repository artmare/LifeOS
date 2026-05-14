"use client";

export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator === "undefined") return;
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}

export const haptics = {
  tap: () => haptic(6),
  success: () => haptic([10, 30, 14]),
  big: () => haptic([20, 40, 20, 40, 60]),
};
