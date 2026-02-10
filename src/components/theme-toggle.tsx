"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  const labels =
    locale === "de"
      ? {
          switchToLight: "Zum hellen Modus wechseln",
          switchToDark: "Zum dunklen Modus wechseln",
          lightMode: "Heller Modus",
          darkMode: "Dunkler Modus",
        }
      : {
          switchToLight: "Switch to light mode",
          switchToDark: "Switch to dark mode",
          lightMode: "Light mode",
          darkMode: "Dark mode",
        };

  useEffect(() => {
    const initialTheme = resolveInitialTheme();
    document.documentElement.setAttribute("data-theme", initialTheme);
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="h-9 w-9 rounded-full border border-border bg-card"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-sm transition hover:border-primary hover:text-primary"
      aria-label={theme === "dark" ? labels.switchToLight : labels.switchToDark}
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? labels.lightMode : labels.darkMode}
    >
      <span className="font-mono">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
