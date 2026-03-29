import { useState, useCallback, useEffect } from "react";

export type Theme = "dark" | "light";
export type FontLevel = 1 | 2 | 3 | 4 | 5;

interface Settings {
  theme: Theme;
  fontLevel: FontLevel;
}

const STORAGE_KEY = "timer_app_settings";

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        theme: parsed.theme === "light" ? "light" : "dark",
        fontLevel: ([1, 2, 3, 4, 5].includes(parsed.fontLevel as number)
          ? parsed.fontLevel
          : 2) as FontLevel,
      };
    }
  } catch {
    // ignore
  }
  return { theme: "dark", fontLevel: 2 };
}

function applySettings(settings: Settings) {
  const html = document.documentElement;
  html.setAttribute("data-font-level", String(settings.fontLevel));
  if (settings.theme === "light") {
    html.setAttribute("data-theme", "light");
  } else {
    html.removeAttribute("data-theme");
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const s = loadSettings();
    applySettings(s);
    return s;
  });

  const setTheme = useCallback((theme: Theme) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applySettings(next);
      return next;
    });
  }, []);

  const setFontLevel = useCallback((fontLevel: FontLevel) => {
    setSettings((prev) => {
      const next = { ...prev, fontLevel };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applySettings(next);
      return next;
    });
  }, []);

  // Apply on mount in case of SSR or rehydration
  useEffect(() => {
    applySettings(settings);
  }, []);

  return { settings, setTheme, setFontLevel };
}
