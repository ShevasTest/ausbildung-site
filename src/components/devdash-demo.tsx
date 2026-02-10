"use client";

import type { CSSProperties, DragEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

type LocaleKey = "de" | "en";
type WidgetId = "weather" | "github" | "pomodoro" | "notes" | "news";
type NewsCategory = "all" | "frontend" | "ai" | "career";
type PomodoroMode = "focus" | "break";

type InstallPromptEventLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type ForecastPoint = {
  dayDe: string;
  dayEn: string;
  icon: string;
  temperature: number;
};

type WeatherCity = {
  id: string;
  name: string;
  conditionDe: string;
  conditionEn: string;
  current: number;
  high: number;
  low: number;
  humidity: number;
  wind: number;
  forecast: ForecastPoint[];
};

type NewsEntry = {
  id: string;
  source: string;
  category: Exclude<NewsCategory, "all">;
  time: string;
  url: string;
  titleDe: string;
  titleEn: string;
  summaryDe: string;
  summaryEn: string;
};

type DemoCopy = {
  badge: string;
  title: string;
  subtitle: string;
  back: string;
  chips: string[];
  controls: {
    time: string;
    connectivity: string;
    online: string;
    offline: string;
    layoutTitle: string;
    layoutHint: string;
    resetLayout: string;
    pwaTitle: string;
    pwaHint: string;
    install: string;
    installAccepted: string;
    installDismissed: string;
    installWaiting: string;
    alreadyInstalled: string;
    secureContext: string;
    manifest: string;
    serviceWorker: string;
    checkOk: string;
    checkMissing: string;
  };
  widgetMeta: Record<WidgetId, { title: string; subtitle: string }>;
  widgetActions: {
    drag: string;
    moveUp: string;
    moveDown: string;
    position: string;
  };
  weather: {
    cityLabel: string;
    high: string;
    low: string;
    humidity: string;
    wind: string;
    forecast: string;
  };
  github: {
    total: string;
    activeDays: string;
    streak: string;
    legend: string;
    no: string;
    intense: string;
  };
  pomodoro: {
    modeFocus: string;
    modeBreak: string;
    sessions: string;
    presets: string;
    start: string;
    pause: string;
    reset: string;
    focusDone: string;
    breakDone: string;
  };
  notes: {
    placeholder: string;
    templatesLabel: string;
    saved: string;
    chars: string;
    templates: string[];
  };
  news: {
    categoryLabel: string;
    open: string;
    categories: Record<NewsCategory, string>;
  };
  footerNote: string;
};

type DevDashDemoProps = {
  locale: string;
};

const STORAGE_KEYS = {
  layout: "devdash-layout-v1",
  notes: "devdash-notes-v1",
  focus: "devdash-focus-v1",
  sessions: "devdash-sessions-v1",
};

const BREAK_SECONDS = 5 * 60;
const FOCUS_PRESETS = [20, 25, 45] as const;
const DEFAULT_WIDGET_ORDER: WidgetId[] = ["weather", "github", "pomodoro", "notes", "news"];

const WIDGET_GRID_CLASSES: Record<WidgetId, string> = {
  weather: "md:col-span-6 xl:col-span-4",
  github: "md:col-span-6 xl:col-span-8",
  pomodoro: "md:col-span-6 xl:col-span-4",
  notes: "md:col-span-6 xl:col-span-4",
  news: "md:col-span-12 xl:col-span-4",
};

const WEATHER_CITIES: WeatherCity[] = [
  {
    id: "berlin",
    name: "Berlin",
    conditionDe: "Leicht bewölkt",
    conditionEn: "Partly cloudy",
    current: 5,
    high: 8,
    low: 1,
    humidity: 74,
    wind: 16,
    forecast: [
      { dayDe: "Di", dayEn: "Tue", icon: "⛅", temperature: 7 },
      { dayDe: "Mi", dayEn: "Wed", icon: "🌤️", temperature: 8 },
      { dayDe: "Do", dayEn: "Thu", icon: "🌧️", temperature: 6 },
      { dayDe: "Fr", dayEn: "Fri", icon: "🌤️", temperature: 9 },
    ],
  },
  {
    id: "hamburg",
    name: "Hamburg",
    conditionDe: "Windig",
    conditionEn: "Windy",
    current: 4,
    high: 7,
    low: 0,
    humidity: 81,
    wind: 24,
    forecast: [
      { dayDe: "Di", dayEn: "Tue", icon: "🌧️", temperature: 5 },
      { dayDe: "Mi", dayEn: "Wed", icon: "🌥️", temperature: 6 },
      { dayDe: "Do", dayEn: "Thu", icon: "🌧️", temperature: 5 },
      { dayDe: "Fr", dayEn: "Fri", icon: "⛅", temperature: 7 },
    ],
  },
  {
    id: "muenchen",
    name: "München",
    conditionDe: "Klar",
    conditionEn: "Clear",
    current: 3,
    high: 7,
    low: -1,
    humidity: 62,
    wind: 12,
    forecast: [
      { dayDe: "Di", dayEn: "Tue", icon: "🌤️", temperature: 6 },
      { dayDe: "Mi", dayEn: "Wed", icon: "☀️", temperature: 8 },
      { dayDe: "Do", dayEn: "Thu", icon: "⛅", temperature: 7 },
      { dayDe: "Fr", dayEn: "Fri", icon: "☀️", temperature: 9 },
    ],
  },
];

const NEWS_FEED: NewsEntry[] = [
  {
    id: "n1",
    source: "Vercel",
    category: "frontend",
    time: "2h",
    url: "https://nextjs.org/blog",
    titleDe: "Next.js verbessert Build-Analysen für große App-Router-Projekte",
    titleEn: "Next.js improves build insights for large App Router projects",
    summaryDe:
      "Neue Analyse-Hinweise helfen, schwere Komponenten schneller zu finden und den Bundle-Impact pro Route klarer zu messen.",
    summaryEn:
      "New analysis hints make it easier to spot heavy components and understand route-level bundle impact.",
  },
  {
    id: "n2",
    source: "GitHub Changelog",
    category: "career",
    time: "5h",
    url: "https://github.blog/changelog/",
    titleDe: "GitHub erweitert Lernpfade für Junior-Entwickler:innen",
    titleEn: "GitHub expands learning paths for junior developers",
    summaryDe:
      "Mehr praxisnahe Übungen zu Pull-Requests, Code-Review und Team-Workflows erleichtern den Einstieg in professionelle Prozesse.",
    summaryEn:
      "More practical drills on pull requests, code review and team workflows support a faster path into professional delivery.",
  },
  {
    id: "n3",
    source: "OpenAI",
    category: "ai",
    time: "7h",
    url: "https://openai.com/news",
    titleDe: "Neue API-Tools fokussieren auf schnellere produktive Integrationen",
    titleEn: "New API tools focus on faster production integrations",
    summaryDe:
      "Der Fokus liegt auf stabilen Entwickler-Flows, besserem Monitoring und klarerer Kostenkontrolle im Produktivbetrieb.",
    summaryEn:
      "The update focuses on stable developer workflows, improved monitoring and clearer cost control in production.",
  },
  {
    id: "n4",
    source: "Web.dev",
    category: "frontend",
    time: "9h",
    url: "https://web.dev/",
    titleDe: "Neue Leitlinien für performante Interaktionen ohne Layout-Jank",
    titleEn: "New guidance for smooth interactions without layout jank",
    summaryDe:
      "Empfohlen werden transform-basierte Motion Patterns und eine frühe Messung von INP in der Entwicklungsphase.",
    summaryEn:
      "Recommendations emphasize transform-based motion patterns and early INP checks during development.",
  },
  {
    id: "n5",
    source: "LinkedIn Learning",
    category: "career",
    time: "12h",
    url: "https://www.linkedin.com/learning/",
    titleDe: "Recruiter achten stärker auf dokumentierte Projektentscheidungen",
    titleEn: "Recruiters focus more on documented project decisions",
    summaryDe:
      "Neben dem UI zählt zunehmend, ob Architektur-Trade-offs und technische Entscheidungen nachvollziehbar erklärt werden.",
    summaryEn:
      "Beyond UI polish, recruiters increasingly value clear explanations of architecture trade-offs and decisions.",
  },
];

const COPY: Record<LocaleKey, DemoCopy> = {
  de: {
    badge: "Live-Demo · Modulares Entwickler-Dashboard",
    title: "DevDash",
    subtitle:
      "Persönliches Start-Dashboard mit Drag-and-Drop-Widgets für Wetter, GitHub-Aktivität, Pomodoro-Fokus, Notizen und Tech-News. Die Konfiguration bleibt lokal gespeichert.",
    back: "Zurück zur Startseite",
    chips: ["Drag & Drop Layout", "Pomodoro Timer", "GitHub Heatmap", "PWA-ready"],
    controls: {
      time: "Lokale Zeit",
      connectivity: "Verbindung",
      online: "Online",
      offline: "Offline",
      layoutTitle: "Layout-Steuerung",
      layoutHint: "Widgets per Drag-Handle neu anordnen. Auf Mobile alternativ mit Pfeiltasten verschieben.",
      resetLayout: "Standard-Layout wiederherstellen",
      pwaTitle: "PWA-Status",
      pwaHint: "Installierbar inkl. Manifest + Service Worker Registrierungscheck.",
      install: "App installieren",
      installAccepted: "Installationsdialog bestätigt",
      installDismissed: "Installationsdialog geschlossen",
      installWaiting: "Installations-Event noch nicht verfügbar",
      alreadyInstalled: "Bereits als App installiert",
      secureContext: "Sicherer Kontext",
      manifest: "Manifest verlinkt",
      serviceWorker: "Service Worker Support",
      checkOk: "OK",
      checkMissing: "Fehlt",
    },
    widgetMeta: {
      weather: {
        title: "Wetter",
        subtitle: "Tagesüberblick für Fokusplanung",
      },
      github: {
        title: "GitHub Heatmap",
        subtitle: "Aktivität und Streak auf einen Blick",
      },
      pomodoro: {
        title: "Pomodoro",
        subtitle: "Fokus-Sessions mit Timer",
      },
      notes: {
        title: "Notizen",
        subtitle: "Schnelle Projekt-Memos (lokal gespeichert)",
      },
      news: {
        title: "Tech-News",
        subtitle: "Kuratiertes Feed-Widget",
      },
    },
    widgetActions: {
      drag: "Widget ziehen",
      moveUp: "Nach oben",
      moveDown: "Nach unten",
      position: "Position",
    },
    weather: {
      cityLabel: "Stadt",
      high: "Max",
      low: "Min",
      humidity: "Luftfeuchte",
      wind: "Wind",
      forecast: "4-Tage-Ausblick",
    },
    github: {
      total: "Contributions (16 Wochen)",
      activeDays: "Aktive Tage",
      streak: "Aktuelle Streak",
      legend: "Intensität",
      no: "Keine",
      intense: "Hoch",
    },
    pomodoro: {
      modeFocus: "Fokus",
      modeBreak: "Pause",
      sessions: "Abgeschlossene Fokus-Sessions",
      presets: "Fokusdauer",
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      focusDone: "Fokus-Block abgeschlossen. Zeit für eine kurze Pause.",
      breakDone: "Pause beendet. Bereit für den nächsten Fokus-Block.",
    },
    notes: {
      placeholder:
        "Heute wichtig: Recruiter-Mail beantworten, Portfolio-Refactoring planen, README für DevDash ergänzen ...",
      templatesLabel: "Vorlagen",
      saved: "Zuletzt gespeichert",
      chars: "Zeichen",
      templates: [
        "Bewerbungs-Task: LinkedIn-Profil aktualisieren",
        "Tech Debt: Widget-Tests und Error-States ergänzen",
        "Learning: Accessibility für Drag-and-Drop vertiefen",
      ],
    },
    news: {
      categoryLabel: "Kategorie",
      open: "Öffnen",
      categories: {
        all: "Alle",
        frontend: "Frontend",
        ai: "AI",
        career: "Karriere",
      },
    },
    footerNote:
      "Hinweis: Wetter-, GitHub- und News-Daten sind realistische Mock-Daten für die Demo. Fokus liegt auf Architektur, UX und interaktiver Produktlogik.",
  },
  en: {
    badge: "Live demo · Modular developer dashboard",
    title: "DevDash",
    subtitle:
      "Personal start dashboard with drag-and-drop widgets for weather, GitHub activity, Pomodoro focus, notes and tech news. Layout and notes are stored locally.",
    back: "Back to homepage",
    chips: ["Drag & drop layout", "Pomodoro timer", "GitHub heatmap", "PWA-ready"],
    controls: {
      time: "Local time",
      connectivity: "Connectivity",
      online: "Online",
      offline: "Offline",
      layoutTitle: "Layout controls",
      layoutHint: "Reorder widgets by drag handle. On mobile, use arrow controls as fallback.",
      resetLayout: "Reset default layout",
      pwaTitle: "PWA status",
      pwaHint: "Install-ready with manifest + service worker support checks.",
      install: "Install app",
      installAccepted: "Install dialog accepted",
      installDismissed: "Install dialog dismissed",
      installWaiting: "Install event not available yet",
      alreadyInstalled: "Already installed as app",
      secureContext: "Secure context",
      manifest: "Manifest linked",
      serviceWorker: "Service worker support",
      checkOk: "OK",
      checkMissing: "Missing",
    },
    widgetMeta: {
      weather: {
        title: "Weather",
        subtitle: "Daily snapshot for focus planning",
      },
      github: {
        title: "GitHub heatmap",
        subtitle: "Activity and streak overview",
      },
      pomodoro: {
        title: "Pomodoro",
        subtitle: "Focus sessions with countdown",
      },
      notes: {
        title: "Notes",
        subtitle: "Quick project memos (saved locally)",
      },
      news: {
        title: "Tech news",
        subtitle: "Curated feed widget",
      },
    },
    widgetActions: {
      drag: "Drag widget",
      moveUp: "Move up",
      moveDown: "Move down",
      position: "Position",
    },
    weather: {
      cityLabel: "City",
      high: "High",
      low: "Low",
      humidity: "Humidity",
      wind: "Wind",
      forecast: "4-day outlook",
    },
    github: {
      total: "Contributions (16 weeks)",
      activeDays: "Active days",
      streak: "Current streak",
      legend: "Intensity",
      no: "None",
      intense: "High",
    },
    pomodoro: {
      modeFocus: "Focus",
      modeBreak: "Break",
      sessions: "Completed focus sessions",
      presets: "Focus duration",
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      focusDone: "Focus block completed. Time for a short break.",
      breakDone: "Break complete. Ready for the next focus block.",
    },
    notes: {
      placeholder:
        "Today: answer recruiter email, plan portfolio refactor, improve DevDash README ...",
      templatesLabel: "Templates",
      saved: "Last saved",
      chars: "Chars",
      templates: [
        "Application task: update LinkedIn profile",
        "Tech debt: add widget tests and error states",
        "Learning: deepen drag-and-drop accessibility",
      ],
    },
    news: {
      categoryLabel: "Category",
      open: "Open",
      categories: {
        all: "All",
        frontend: "Frontend",
        ai: "AI",
        career: "Career",
      },
    },
    footerNote:
      "Note: weather, GitHub and news are realistic mock datasets for demo purposes. The focus is architecture, UX and interactive product behavior.",
  },
};

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function isWidgetId(value: string): value is WidgetId {
  return DEFAULT_WIDGET_ORDER.includes(value as WidgetId);
}

function isWidgetOrder(value: unknown): value is WidgetId[] {
  if (!Array.isArray(value) || value.length !== DEFAULT_WIDGET_ORDER.length) {
    return false;
  }

  const normalized = [...value].sort().join("|");
  const expected = [...DEFAULT_WIDGET_ORDER].sort().join("|");

  return normalized === expected;
}

function reorderWidgets(order: WidgetId[], fromId: WidgetId, toId: WidgetId) {
  const fromIndex = order.indexOf(fromId);
  const toIndex = order.indexOf(toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return order;
  }

  const next = [...order];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function heatLevel(value: number) {
  if (value <= 0) {
    return 0;
  }

  if (value <= 2) {
    return 1;
  }

  if (value <= 4) {
    return 2;
  }

  if (value <= 7) {
    return 3;
  }

  return 4;
}

function createHeatmapMatrix(weeks = 16) {
  return Array.from({ length: weeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const wave = Math.sin((weekIndex + 1) * 0.7 + dayIndex * 0.92) * 3;
      const trend = ((weekIndex * 11 + dayIndex * 7 + 9) % 9) - 2;
      const count = Math.round(wave + trend);
      return Math.max(0, count);
    }),
  );
}

function getIntlLocale(locale: LocaleKey) {
  return locale === "de" ? "de-DE" : "en-US";
}

export function DevDashDemo({ locale }: DevDashDemoProps) {
  const localeKey: LocaleKey = locale === "de" ? "de" : "en";
  const intlLocale = getIntlLocale(localeKey);
  const copy = COPY[localeKey];

  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(DEFAULT_WIDGET_ORDER);
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null);
  const [dropTargetWidget, setDropTargetWidget] = useState<WidgetId | null>(null);

  const [activeCityId, setActiveCityId] = useState<string>(WEATHER_CITIES[0].id);

  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [pomodoroInfo, setPomodoroInfo] = useState<string>("");

  const [notes, setNotes] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const [newsCategory, setNewsCategory] = useState<NewsCategory>("all");

  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  const [now, setNow] = useState<number>(Date.now());
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [hasServiceWorkerSupport, setHasServiceWorkerSupport] = useState(false);
  const [hasManifestLink, setHasManifestLink] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<InstallPromptEventLike | null>(null);
  const [installOutcome, setInstallOutcome] = useState<"idle" | "accepted" | "dismissed">("idle");

  const heatmap = useMemo(() => createHeatmapMatrix(16), []);

  const selectedCity =
    WEATHER_CITIES.find((city) => city.id === activeCityId) ?? WEATHER_CITIES[0];

  const weatherMaxTemp = useMemo(
    () => Math.max(...selectedCity.forecast.map((item) => item.temperature), 1),
    [selectedCity.forecast],
  );

  const heatmapStats = useMemo(() => {
    const allValues = heatmap.flat();
    const total = allValues.reduce((sum, value) => sum + value, 0);
    const activeDays = allValues.filter((value) => value > 0).length;

    let currentStreak = 0;
    for (let index = allValues.length - 1; index >= 0; index -= 1) {
      if (allValues[index] > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return {
      total,
      activeDays,
      currentStreak,
    };
  }, [heatmap]);

  const filteredNews = useMemo(() => {
    if (newsCategory === "all") {
      return NEWS_FEED;
    }

    return NEWS_FEED.filter((item) => item.category === newsCategory);
  }, [newsCategory]);

  const pomodoroBaseSeconds = pomodoroMode === "focus" ? focusMinutes * 60 : BREAK_SECONDS;
  const pomodoroProgress = pomodoroBaseSeconds > 0 ? (pomodoroBaseSeconds - secondsLeft) / pomodoroBaseSeconds : 0;
  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - Math.min(Math.max(pomodoroProgress, 0), 1));

  useEffect(() => {
    try {
      const storedLayout = window.localStorage.getItem(STORAGE_KEYS.layout);
      if (storedLayout) {
        const parsed = JSON.parse(storedLayout) as unknown;
        if (isWidgetOrder(parsed)) {
          setWidgetOrder(parsed);
        }
      }

      const storedNotes = window.localStorage.getItem(STORAGE_KEYS.notes);
      if (typeof storedNotes === "string") {
        setNotes(storedNotes);
      }

      const storedFocus = window.localStorage.getItem(STORAGE_KEYS.focus);
      if (storedFocus) {
        const parsedFocus = Number(storedFocus);
        if (Number.isFinite(parsedFocus) && parsedFocus >= 15 && parsedFocus <= 90) {
          setFocusMinutes(parsedFocus);
          setSecondsLeft(parsedFocus * 60);
        }
      }

      const storedSessions = window.localStorage.getItem(STORAGE_KEYS.sessions);
      if (storedSessions) {
        const parsedSessions = Number(storedSessions);
        if (Number.isFinite(parsedSessions) && parsedSessions >= 0) {
          setCompletedSessions(parsedSessions);
        }
      }
    } catch {
      // Ignore storage access issues in strict environments.
    } finally {
      setHasHydratedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEYS.layout, JSON.stringify(widgetOrder));
    } catch {
      // Ignore storage failures.
    }
  }, [hasHydratedStorage, widgetOrder]);

  useEffect(() => {
    if (!hasHydratedStorage) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEYS.notes, notes);
      setLastSavedAt(Date.now());
    } catch {
      // Ignore storage failures.
    }
  }, [hasHydratedStorage, notes]);

  useEffect(() => {
    if (!hasHydratedStorage) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEYS.focus, String(focusMinutes));
      window.localStorage.setItem(STORAGE_KEYS.sessions, String(completedSessions));
    } catch {
      // Ignore storage failures.
    }
  }, [completedSessions, focusMinutes, hasHydratedStorage]);

  useEffect(() => {
    const minuteTicker = window.setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(minuteTicker);
    };
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setHasServiceWorkerSupport("serviceWorker" in navigator);
    setHasManifestLink(Boolean(document.querySelector('link[rel="manifest"]')));
    setIsSecureContext(window.isSecureContext);

    const standaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    const iOSStandalone =
      typeof navigator !== "undefined" &&
      "standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    setIsInstalled(standaloneMode || iOSStandalone);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as InstallPromptEventLike);
      setInstallOutcome("idle");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
      setInstallOutcome("accepted");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft > 0) {
      return;
    }

    setIsRunning(false);

    if (pomodoroMode === "focus") {
      setCompletedSessions((previous) => previous + 1);
      setPomodoroMode("break");
      setSecondsLeft(BREAK_SECONDS);
      setPomodoroInfo(copy.pomodoro.focusDone);
      return;
    }

    setPomodoroMode("focus");
    setSecondsLeft(focusMinutes * 60);
    setPomodoroInfo(copy.pomodoro.breakDone);
  }, [copy.pomodoro.breakDone, copy.pomodoro.focusDone, focusMinutes, pomodoroMode, secondsLeft]);

  const reorderWithDirection = (widgetId: WidgetId, offset: -1 | 1) => {
    setWidgetOrder((previous) => {
      const currentIndex = previous.indexOf(widgetId);
      if (currentIndex < 0) {
        return previous;
      }

      const targetIndex = currentIndex + offset;
      if (targetIndex < 0 || targetIndex >= previous.length) {
        return previous;
      }

      const next = [...previous];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    try {
      await installPromptEvent.prompt();
      const result = await installPromptEvent.userChoice;
      setInstallOutcome(result.outcome);
      setInstallPromptEvent(null);

      if (result.outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch {
      setInstallOutcome("dismissed");
      setInstallPromptEvent(null);
    }
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, widgetId: WidgetId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", widgetId);
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>, widgetId: WidgetId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetWidget(widgetId);
  };

  const handleDrop = (event: DragEvent<HTMLElement>, widgetId: WidgetId) => {
    event.preventDefault();

    const rawSource = event.dataTransfer.getData("text/plain");
    const sourceWidget =
      draggedWidget ?? (isWidgetId(rawSource) ? (rawSource as WidgetId) : null);

    if (!sourceWidget || sourceWidget === widgetId) {
      setDropTargetWidget(null);
      setDraggedWidget(null);
      return;
    }

    setWidgetOrder((previous) => reorderWidgets(previous, sourceWidget, widgetId));
    setDropTargetWidget(null);
    setDraggedWidget(null);
  };

  const handleFocusPreset = (minutes: number) => {
    setFocusMinutes(minutes);
    if (pomodoroMode === "focus" && !isRunning) {
      setSecondsLeft(minutes * 60);
    }
  };

  const handlePomodoroReset = () => {
    setIsRunning(false);
    setPomodoroInfo("");
    if (pomodoroMode === "focus") {
      setSecondsLeft(focusMinutes * 60);
    } else {
      setSecondsLeft(BREAK_SECONDS);
    }
  };

  const installStatusText = isInstalled
    ? copy.controls.alreadyInstalled
    : installOutcome === "accepted"
      ? copy.controls.installAccepted
      : installOutcome === "dismissed"
        ? copy.controls.installDismissed
        : installPromptEvent
          ? copy.controls.pwaHint
          : copy.controls.installWaiting;

  const canInstall = Boolean(installPromptEvent) && !isInstalled;

  const renderWidgetContent = (widgetId: WidgetId) => {
    if (widgetId === "weather") {
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
              {copy.weather.cityLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER_CITIES.map((city) => {
                const isActive = city.id === selectedCity.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setActiveCityId(city.id)}
                    aria-pressed={isActive}
                    className={`devdash-pill rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      isActive
                        ? "border-primary/45 bg-primary/12 text-primary"
                        : "border-border bg-background/70 text-muted"
                    }`}
                  >
                    {city.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/65 p-3.5">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedCity.name}</p>
                <p className="text-xs text-muted">
                  {localeKey === "de" ? selectedCity.conditionDe : selectedCity.conditionEn}
                </p>
              </div>
              <p className="text-3xl font-semibold text-foreground">{selectedCity.current}°</p>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                <dt className="text-muted">{copy.weather.high}</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{selectedCity.high}°</dd>
              </div>
              <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                <dt className="text-muted">{copy.weather.low}</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{selectedCity.low}°</dd>
              </div>
              <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                <dt className="text-muted">{copy.weather.humidity}</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{selectedCity.humidity}%</dd>
              </div>
              <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                <dt className="text-muted">{copy.weather.wind}</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{selectedCity.wind} km/h</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
              {copy.weather.forecast}
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {selectedCity.forecast.map((entry) => {
                const barStyle = {
                  "--devdash-forecast-scale": (entry.temperature / weatherMaxTemp).toFixed(3),
                } as CSSProperties;

                return (
                  <li key={`${selectedCity.id}-${entry.dayDe}`} className="rounded-xl border border-border bg-background/70 p-2 text-center">
                    <p className="text-[11px] text-muted">{localeKey === "de" ? entry.dayDe : entry.dayEn}</p>
                    <p className="mt-1 text-sm">{entry.icon}</p>
                    <div className="mx-auto mt-2 h-8 w-2 overflow-hidden rounded-full border border-border bg-primary/10">
                      <span className="devdash-forecast-fill is-visible" style={barStyle} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-foreground">{entry.temperature}°</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      );
    }

    if (widgetId === "github") {
      return (
        <div className="space-y-4">
          <dl className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <dt className="text-[11px] tracking-[0.13em] text-muted uppercase">{copy.github.total}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{heatmapStats.total}</dd>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <dt className="text-[11px] tracking-[0.13em] text-muted uppercase">{copy.github.activeDays}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{heatmapStats.activeDays}</dd>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <dt className="text-[11px] tracking-[0.13em] text-muted uppercase">{copy.github.streak}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">{heatmapStats.currentStreak}</dd>
            </div>
          </dl>

          <div className="overflow-x-auto rounded-2xl border border-border bg-background/65 p-3">
            <div className="inline-grid grid-flow-col gap-1">
              {heatmap.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
                  {week.map((value, dayIndex) => (
                    <span
                      key={`day-${weekIndex}-${dayIndex}`}
                      className={`devdash-heat-cell level-${heatLevel(value)}`}
                      title={`${value} contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
            <p>{copy.github.legend}</p>
            <div className="flex items-center gap-1.5">
              <span>{copy.github.no}</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <span key={`legend-${level}`} className={`devdash-heat-cell level-${level}`} />
              ))}
              <span>{copy.github.intense}</span>
            </div>
          </div>
        </div>
      );
    }

    if (widgetId === "pomodoro") {
      return (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)]">
            <div className="flex items-center justify-center rounded-2xl border border-border bg-background/70 p-3">
              <div className="relative h-[132px] w-[132px]">
                <svg viewBox="0 0 120 120" className="h-full w-full">
                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    stroke="currentColor"
                    strokeOpacity="0.16"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    stroke="rgb(59 130 246)"
                    strokeWidth="9"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 60 60)"
                    className="devdash-ring-progress"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-semibold text-foreground">{formatTime(secondsLeft)}</p>
                  <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
                    {pomodoroMode === "focus" ? copy.pomodoro.modeFocus : copy.pomodoro.modeBreak}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.pomodoro.sessions}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{completedSessions}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.pomodoro.presets}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FOCUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleFocusPreset(preset)}
                      aria-pressed={focusMinutes === preset}
                      className={`devdash-pill rounded-full border px-3 py-1 text-xs font-semibold ${
                        focusMinutes === preset
                          ? "border-primary/45 bg-primary/12 text-primary"
                          : "border-border bg-card text-muted"
                      }`}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunning((previous) => !previous)}
                  className="contact-submit rounded-full bg-primary-solid px-4 py-2 text-sm font-semibold text-white"
                >
                  {isRunning ? copy.pomodoro.pause : copy.pomodoro.start}
                </button>
                <button
                  type="button"
                  onClick={handlePomodoroReset}
                  className="devdash-pill rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted"
                >
                  {copy.pomodoro.reset}
                </button>
              </div>
            </div>
          </div>

          {pomodoroInfo ? (
            <p className="rounded-xl border border-primary/28 bg-primary/10 px-3 py-2 text-xs text-muted">{pomodoroInfo}</p>
          ) : null}
        </div>
      );
    }

    if (widgetId === "notes") {
      const formattedSavedTime =
        lastSavedAt !== null
          ? new Intl.DateTimeFormat(intlLocale, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(lastSavedAt))
          : "—";

      return (
        <div className="space-y-3">
          <label htmlFor="devdash-notes" className="sr-only">
            Notes
          </label>
          <textarea
            id="devdash-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={copy.notes.placeholder}
            className="contact-field min-h-[166px] w-full resize-y rounded-2xl px-3 py-2.5 text-sm leading-relaxed"
          />

          <div>
            <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.notes.templatesLabel}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {copy.notes.templates.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() =>
                    setNotes((previous) =>
                      previous.trim().length > 0 ? `${previous}\n• ${template}` : `• ${template}`,
                    )
                  }
                  className="devdash-pill max-w-full rounded-full border border-border bg-background/70 px-2.5 py-1 text-left text-xs font-medium text-muted whitespace-normal"
                >
                  + {template}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-muted">
            <span>
              {copy.notes.saved}: {formattedSavedTime}
            </span>
            <span>
              {copy.notes.chars}: {notes.length}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.news.categoryLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(copy.news.categories) as NewsCategory[]).map((categoryKey) => (
              <button
                key={categoryKey}
                type="button"
                onClick={() => setNewsCategory(categoryKey)}
                aria-pressed={newsCategory === categoryKey}
                className={`devdash-pill rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  newsCategory === categoryKey
                    ? "border-primary/45 bg-primary/12 text-primary"
                    : "border-border bg-background/70 text-muted"
                }`}
              >
                {copy.news.categories[categoryKey]}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2">
          {filteredNews.map((entry) => (
            <li key={entry.id}>
              <article className="devdash-news-item rounded-2xl border border-border bg-background/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-muted">
                    {entry.source} · {entry.time}
                  </p>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary transition hover:opacity-80"
                  >
                    {copy.news.open} ↗
                  </a>
                </div>
                <h3 className="mt-1 break-words text-sm font-semibold text-foreground">
                  {localeKey === "de" ? entry.titleDe : entry.titleEn}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {localeKey === "de" ? entry.summaryDe : entry.summaryEn}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {copy.badge}
          </span>
          <Link
            href="/#projects"
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            ← {copy.back}
          </Link>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-4xl leading-relaxed text-muted">{copy.subtitle}</p>

        <ul className="mt-5 flex flex-wrap gap-2.5">
          {copy.chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-muted"
            >
              {chip}
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-background/70 p-3.5">
            <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.controls.time}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {new Intl.DateTimeFormat(intlLocale, {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(now))}
            </p>
            <p className="mt-1 text-xs text-muted">
              {copy.controls.connectivity}: {isOnline ? copy.controls.online : copy.controls.offline}
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-background/70 p-3.5">
            <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.controls.layoutTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{copy.controls.layoutHint}</p>
            <button
              type="button"
              onClick={() => setWidgetOrder(DEFAULT_WIDGET_ORDER)}
              className="devdash-pill mt-3 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted"
            >
              {copy.controls.resetLayout}
            </button>
          </article>

          <article className="rounded-2xl border border-border bg-background/70 p-3.5">
            <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.controls.pwaTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{installStatusText}</p>

            <ul className="mt-2 space-y-1 text-xs text-muted">
              <li>
                {copy.controls.secureContext}: {isSecureContext ? copy.controls.checkOk : copy.controls.checkMissing}
              </li>
              <li>
                {copy.controls.manifest}: {hasManifestLink ? copy.controls.checkOk : copy.controls.checkMissing}
              </li>
              <li>
                {copy.controls.serviceWorker}: {hasServiceWorkerSupport ? copy.controls.checkOk : copy.controls.checkMissing}
              </li>
            </ul>

            <button
              type="button"
              disabled={!canInstall}
              onClick={handleInstall}
              className="contact-submit mt-3 rounded-full bg-primary-solid px-3.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {copy.controls.install}
            </button>
          </article>
        </div>
      </div>

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
        {widgetOrder.map((widgetId) => {
          const widgetPosition = widgetOrder.indexOf(widgetId) + 1;

          return (
            <article
              key={widgetId}
              onDragOver={(event) => handleDragOver(event, widgetId)}
              onDrop={(event) => handleDrop(event, widgetId)}
              onDragLeave={() => setDropTargetWidget(null)}
              className={`devdash-widget min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-5 ${WIDGET_GRID_CLASSES[widgetId]} ${
                draggedWidget === widgetId ? "is-dragging" : ""
              } ${dropTargetWidget === widgetId ? "is-target" : ""}`}
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {copy.widgetMeta[widgetId].title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">{copy.widgetMeta[widgetId].subtitle}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => reorderWithDirection(widgetId, -1)}
                    className="devdash-icon-btn rounded-full border border-border bg-background/75 px-2 py-1 text-xs text-muted"
                    aria-label={copy.widgetActions.moveUp}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderWithDirection(widgetId, 1)}
                    className="devdash-icon-btn rounded-full border border-border bg-background/75 px-2 py-1 text-xs text-muted"
                    aria-label={copy.widgetActions.moveDown}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, widgetId)}
                    onDragEnd={() => {
                      setDraggedWidget(null);
                      setDropTargetWidget(null);
                    }}
                    className="devdash-drag-handle rounded-full border border-border bg-background/75 px-2 py-1 text-xs text-muted"
                    aria-label={copy.widgetActions.drag}
                  >
                    ⋮⋮
                  </button>
                </div>
              </header>

              <p className="mt-2 text-[11px] text-muted">
                {copy.widgetActions.position}: {widgetPosition}/{widgetOrder.length}
              </p>

              <div className="mt-4">{renderWidgetContent(widgetId)}</div>
            </article>
          );
        })}
      </section>

      <p className="mt-5 text-xs leading-relaxed text-muted">{copy.footerNote}</p>
    </main>
  );
}
