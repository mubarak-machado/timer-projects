import { create } from "zustand";

type Theme = "dark" | "light";
type FontSizeLevel = 1 | 2 | 3 | 4 | 5;

const FONT_SIZE_LABELS: Record<FontSizeLevel, string> = {
  1: "Pequeno",
  2: "Médio",
  3: "Grande",
  4: "Muito Grande",
  5: "Máximo",
};

interface SettingsState {
  theme: Theme;
  fontSizeLevel: FontSizeLevel;
  setTheme: (theme: Theme) => void;
  setFontSizeLevel: (level: FontSizeLevel) => void;
}

function loadSettings(): { theme: Theme; fontSizeLevel: FontSizeLevel } {
  try {
    const raw = localStorage.getItem("timer_app_settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        theme: parsed.theme === "light" ? "light" : "dark",
        fontSizeLevel: [1, 2, 3, 4, 5].includes(parsed.fontSizeLevel)
          ? (parsed.fontSizeLevel as FontSizeLevel)
          : 3,
      };
    }
  } catch {
    // ignore
  }
  return { theme: "dark", fontSizeLevel: 3 };
}

function persistSettings(state: { theme: Theme; fontSizeLevel: FontSizeLevel }) {
  localStorage.setItem("timer_app_settings", JSON.stringify(state));
}

function applyToDOM(theme: Theme, fontSizeLevel: FontSizeLevel) {
  const html = document.documentElement;
  if (theme === "light") {
    html.setAttribute("data-theme", "light");
  } else {
    html.removeAttribute("data-theme");
  }
  html.setAttribute("data-font-size", String(fontSizeLevel));
}

const initial = loadSettings();
applyToDOM(initial.theme, initial.fontSizeLevel);

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: initial.theme,
  fontSizeLevel: initial.fontSizeLevel,

  setTheme: (theme) =>
    set((state) => {
      const next = { ...state, theme };
      persistSettings(next);
      applyToDOM(next.theme, next.fontSizeLevel);
      return { theme };
    }),

  setFontSizeLevel: (fontSizeLevel) =>
    set((state) => {
      const next = { ...state, fontSizeLevel };
      persistSettings(next);
      applyToDOM(next.theme, next.fontSizeLevel);
      return { fontSizeLevel };
    }),
}));

export { FONT_SIZE_LABELS };
export type { Theme, FontSizeLevel };
