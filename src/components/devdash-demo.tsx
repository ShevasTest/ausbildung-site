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

type WeatherLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type LiveForecastPoint = {
  day: string;
  icon: string;
  temperature: number;
};

type LiveWeather = {
  conditionDe: string;
  conditionEn: string;
  current: number;
  high: number;
  low: number;
  humidity: number;
  wind: number;
  forecast: LiveForecastPoint[];
};

type LiveNewsEntry = {
  id: number;
  title: string;
  url: string;
  source: string;
  time: string;
  category: Exclude<NewsCategory, "all">;
  score: number;
};

type GithubActivityResponse = {
  user: string;
  days: Array<{ date: string; count: number }>;
  followers: number;
  publicRepos: number;
  recentRepos: Array<{ name: string; url: string; pushedAt: string }>;
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
    addNote: string;
    deleteNote: string;
    noteLabel: string;
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

const WEATHER_LOCATIONS: WeatherLocation[] = [
  { id: "berlin", name: "Berlin", latitude: 52.52, longitude: 13.405 },
  { id: "hamburg", name: "Hamburg", latitude: 53.5511, longitude: 9.9937 },
  { id: "muenchen", name: "München", latitude: 48.1351, longitude: 11.582 },
];

const WMO_CONDITIONS: Array<{
  codes: number[];
  icon: string;
  de: string;
  en: string;
}> = [
  { codes: [0], icon: "☀️", de: "Klar", en: "Clear" },
  { codes: [1, 2], icon: "🌤️", de: "Leicht bewölkt", en: "Partly cloudy" },
  { codes: [3], icon: "🌥️", de: "Bedeckt", en: "Overcast" },
  { codes: [45, 48], icon: "🌫️", de: "Nebel", en: "Fog" },
  { codes: [51, 53, 55, 56, 57], icon: "🌦️", de: "Nieselregen", en: "Drizzle" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], icon: "🌧️", de: "Regen", en: "Rain" },
  { codes: [71, 73, 75, 77, 85, 86], icon: "🌨️", de: "Schnee", en: "Snow" },
  { codes: [95, 96, 99], icon: "⛈️", de: "Gewitter", en: "Thunderstorm" },
];

function describeWeatherCode(code: number) {
  return (
    WMO_CONDITIONS.find((entry) => entry.codes.includes(code)) ?? {
      icon: "🌡️",
      de: "Wechselhaft",
      en: "Mixed",
    }
  );
}

async function fetchLiveWeather(
  location: WeatherLocation,
  intlLocale: string,
): Promise<LiveWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=6";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("weather_unavailable");
  }

  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      relative_humidity_2m?: number;
      wind_speed_10m?: number;
      weather_code?: number;
    };
    daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
    };
  };

  const condition = describeWeatherCode(data.current?.weather_code ?? -1);
  const dayFormatter = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });

  const forecast: LiveForecastPoint[] = (data.daily?.time ?? [])
    .map((iso, index) => ({
      day: dayFormatter.format(new Date(`${iso}T12:00:00`)),
      icon: describeWeatherCode(data.daily?.weather_code?.[index] ?? -1).icon,
      temperature: Math.round(data.daily?.temperature_2m_max?.[index] ?? 0),
    }))
    .slice(1, 5);

  return {
    conditionDe: condition.de,
    conditionEn: condition.en,
    current: Math.round(data.current?.temperature_2m ?? 0),
    high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
    low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
    humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
    wind: Math.round(data.current?.wind_speed_10m ?? 0),
    forecast,
  };
}

const NEWS_CACHE_KEY = "devdash-news-v1";
const NEWS_CACHE_TTL_MS = 10 * 60 * 1000;

function classifyNews(title: string): Exclude<NewsCategory, "all"> {
  if (/\b(ai|gpt|llm|claude|gemini|model|openai|anthropic|ml)\b/i.test(title)) {
    return "ai";
  }

  if (/(hiring|job|career|interview|salary|resume|work)/i.test(title)) {
    return "career";
  }

  return "frontend";
}

function relativeHours(unixSeconds: number, localeKey: LocaleKey) {
  const diffHours = Math.max(0, Math.round((Date.now() / 1000 - unixSeconds) / 3600));
  if (diffHours < 1) {
    return "<1h";
  }

  if (diffHours >= 48) {
    const days = Math.round(diffHours / 24);
    return localeKey === "de" ? `vor ${days} Tagen` : `${days}d ago`;
  }

  return `${diffHours}h`;
}

async function fetchHackerNews(localeKey: LocaleKey): Promise<LiveNewsEntry[]> {
  try {
    const cachedRaw = window.sessionStorage.getItem(NEWS_CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as { at: number; items: LiveNewsEntry[] };
      if (Date.now() - cached.at < NEWS_CACHE_TTL_MS && Array.isArray(cached.items)) {
        return cached.items;
      }
    }
  } catch {
    // Ignore cache issues and fetch fresh data.
  }

  const idsResponse = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!idsResponse.ok) {
    throw new Error("news_unavailable");
  }

  const ids = ((await idsResponse.json()) as number[]).slice(0, 30);
  const items = await Promise.all(
    ids.map(async (id) => {
      const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (!itemResponse.ok) {
        return null;
      }

      return (await itemResponse.json()) as {
        id?: number;
        title?: string;
        url?: string;
        score?: number;
        time?: number;
        type?: string;
      } | null;
    }),
  );

  const entries: LiveNewsEntry[] = items
    .filter(
      (item): item is { id: number; title: string; url: string; score?: number; time?: number; type?: string } =>
        Boolean(item && item.type === "story" && item.id && item.title && item.url),
    )
    .map((item) => {
      let source = "news.ycombinator.com";
      try {
        source = new URL(item.url).hostname.replace(/^www\./, "");
      } catch {
        // Keep fallback source label.
      }

      return {
        id: item.id,
        title: item.title,
        url: item.url,
        source,
        time: relativeHours(item.time ?? Date.now() / 1000, localeKey),
        category: classifyNews(item.title),
        score: item.score ?? 0,
      };
    })
    .slice(0, 12);

  try {
    window.sessionStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ at: Date.now(), items: entries }));
  } catch {
    // Storage unavailable: skip caching.
  }

  return entries;
}

const COPY: Record<LocaleKey, DemoCopy> = {
  de: {
    badge: "Live-Demo · Modulares Entwickler-Dashboard",
    title: "DevDash",
    subtitle:
      "Persönliches Start-Dashboard mit Drag-and-Drop-Widgets: Live-Wetter (Open-Meteo), echte GitHub-Aktivität, Pomodoro-Fokus, Notizen und ein Live-Feed von Hacker News. Layout und Notizen bleiben lokal gespeichert.",
    back: "Zurück zur Startseite",
    chips: ["Live-APIs", "Drag & Drop Layout", "Pomodoro Timer", "PWA-ready"],
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
        subtitle: "Live-Daten von Open-Meteo",
      },
      github: {
        title: "GitHub API Pulse",
        subtitle: "Öffentliche Repositories und Events von @ShevasTest",
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
        subtitle: "Live-Feed von Hacker News",
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
      total: "Öffentliche Repositories",
      activeDays: "Kürzlich aktualisiert",
      streak: "Follower",
      legend: "Öffentliche Events · letzte 90 Tage",
      no: "Keine Aktivität",
      intense: "Hohe Aktivität",
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
      addNote: "+ Neue Notiz",
      deleteNote: "🗑️ Löschen",
      noteLabel: "Notiz",
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
      "Hinweis: Wetter (Open-Meteo), GitHub-Aktivität und Tech-News (Hacker News) sind Live-Daten aus echten APIs. Bei Ausfall einer Quelle zeigt das Widget einen klaren Fehler- oder Beispielzustand.",
  },
  en: {
    badge: "Live demo · Modular developer dashboard",
    title: "DevDash",
    subtitle:
      "Personal start dashboard with drag-and-drop widgets: live weather (Open-Meteo), real GitHub activity, Pomodoro focus, notes and a live Hacker News feed. Layout and notes are stored locally.",
    back: "Back to homepage",
    chips: ["Live APIs", "Drag & drop layout", "Pomodoro timer", "PWA-ready"],
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
        subtitle: "Live data from Open-Meteo",
      },
      github: {
        title: "GitHub API pulse",
        subtitle: "Public repositories and events from @ShevasTest",
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
        subtitle: "Live feed from Hacker News",
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
      total: "Public repositories",
      activeDays: "Recently updated",
      streak: "Followers",
      legend: "Public events · last 90 days",
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
      addNote: "+ New note",
      deleteNote: "🗑️ Delete",
      noteLabel: "Note",
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
      "Note: weather (Open-Meteo), GitHub activity and tech news (Hacker News) are live data from real APIs. If a source is unavailable, the widget shows a clear error or sample state.",
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

  const [activeCityId, setActiveCityId] = useState<string>(WEATHER_LOCATIONS[0].id);
  const [weatherByCity, setWeatherByCity] = useState<Record<string, LiveWeather>>({});
  const [weatherStatus, setWeatherStatus] = useState<"loading" | "ready" | "error">("loading");

  const [githubData, setGithubData] = useState<GithubActivityResponse | null>(null);
  const [githubStatus, setGithubStatus] = useState<"loading" | "ready" | "error">("loading");

  const [newsItems, setNewsItems] = useState<LiveNewsEntry[]>([]);
  const [newsStatus, setNewsStatus] = useState<"loading" | "ready" | "error">("loading");

  const [focusMinutes, setFocusMinutes] = useState<number>(25);
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>("focus");
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [pomodoroInfo, setPomodoroInfo] = useState<string>("");

  const [notes, setNotes] = useState<string[]>([""]);
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

  useEffect(() => {
    const location =
      WEATHER_LOCATIONS.find((entry) => entry.id === activeCityId) ?? WEATHER_LOCATIONS[0];

    if (weatherByCity[location.id]) {
      return;
    }

    let cancelled = false;
    setWeatherStatus("loading");

    fetchLiveWeather(location, intlLocale)
      .then((weather) => {
        if (cancelled) {
          return;
        }

        setWeatherByCity((previous) => ({ ...previous, [location.id]: weather }));
        setWeatherStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setWeatherStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCityId, intlLocale, weatherByCity]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/github")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("github_unavailable");
        }

        return (await response.json()) as GithubActivityResponse;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        setGithubData(data);
        setGithubStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setGithubStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchHackerNews(localeKey)
      .then((items) => {
        if (cancelled) {
          return;
        }

        setNewsItems(items);
        setNewsStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setNewsStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [localeKey]);

  const heatmap = useMemo(() => {
    if (githubData && githubData.days.length > 0) {
      // Column-per-week matrix from real daily event counts (13 weeks).
      const days = githubData.days;
      const weeks: number[][] = [];
      for (let index = 0; index < days.length; index += 7) {
        weeks.push(days.slice(index, index + 7).map((day) => day.count));
      }
      return weeks;
    }

    return createHeatmapMatrix(13);
  }, [githubData]);

  const selectedLocation =
    WEATHER_LOCATIONS.find((entry) => entry.id === activeCityId) ?? WEATHER_LOCATIONS[0];
  const selectedWeather = weatherByCity[selectedLocation.id] ?? null;

  const weatherMaxTemp = useMemo(
    () => Math.max(...(selectedWeather?.forecast ?? []).map((item) => item.temperature), 1),
    [selectedWeather],
  );

  const filteredNews = useMemo(() => {
    const base = newsCategory === "all" ? newsItems : newsItems.filter((item) => item.category === newsCategory);
    return base.slice(0, 6);
  }, [newsCategory, newsItems]);

  const pomodoroBaseSeconds = pomodoroMode === "focus" ? focusMinutes * 60 : BREAK_SECONDS;
  const pomodoroProgress = pomodoroBaseSeconds > 0 ? (pomodoroBaseSeconds - secondsLeft) / pomodoroBaseSeconds : 0;
  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - Math.min(Math.max(pomodoroProgress, 0), 1));

  const addNote = () => {
    setNotes((previous) => [...previous, ""]);
  };

  const updateNote = (index: number, value: string) => {
    setNotes((previous) => previous.map((note, noteIndex) => (noteIndex === index ? value : note)));
  };

  const deleteNote = (index: number) => {
    setNotes((previous) => {
      if (previous.length <= 1) {
        return [""];
      }

      return previous.filter((_, noteIndex) => noteIndex !== index);
    });
  };

  const insertTemplateIntoLatestNote = (template: string) => {
    setNotes((previous) => {
      if (previous.length === 0) {
        return [`• ${template}`];
      }

      const targetIndex = previous.length - 1;
      const currentText = previous[targetIndex] ?? "";
      const nextText = currentText.trim().length > 0 ? `${currentText}\n• ${template}` : `• ${template}`;

      return previous.map((note, noteIndex) => (noteIndex === targetIndex ? nextText : note));
    });
  };

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
      if (typeof storedNotes === "string" && storedNotes.length > 0) {
        try {
          const parsedNotes = JSON.parse(storedNotes) as unknown;
          if (Array.isArray(parsedNotes) && parsedNotes.every((entry) => typeof entry === "string")) {
            setNotes(parsedNotes.length > 0 ? parsedNotes : [""]);
          } else {
            setNotes([storedNotes]);
          }
        } catch {
          setNotes([storedNotes]);
        }
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
      window.localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
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
              {WEATHER_LOCATIONS.map((city) => {
                const isActive = city.id === selectedLocation.id;
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

          {!selectedWeather ? (
            <div className="rounded-2xl border border-border bg-background/65 p-3.5">
              <p className="text-sm text-muted">
                {weatherStatus === "error"
                  ? localeKey === "de"
                    ? "Wetterdaten sind gerade nicht erreichbar. Bitte später erneut versuchen."
                    : "Weather data is currently unavailable. Please try again later."
                  : localeKey === "de"
                    ? "Lade Live-Wetterdaten (Open-Meteo) ..."
                    : "Loading live weather data (Open-Meteo) ..."}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-border bg-background/65 p-3.5">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedLocation.name}</p>
                    <p className="text-xs text-muted">
                      {localeKey === "de" ? selectedWeather.conditionDe : selectedWeather.conditionEn}
                    </p>
                  </div>
                  <p className="text-3xl font-semibold text-foreground">{selectedWeather.current}°</p>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                    <dt className="text-muted">{copy.weather.high}</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedWeather.high}°</dd>
                  </div>
                  <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                    <dt className="text-muted">{copy.weather.low}</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedWeather.low}°</dd>
                  </div>
                  <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                    <dt className="text-muted">{copy.weather.humidity}</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedWeather.humidity}&nbsp;%</dd>
                  </div>
                  <div className="rounded-xl border border-border bg-card px-2.5 py-2">
                    <dt className="text-muted">{copy.weather.wind}</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedWeather.wind} km/h</dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">
                  {copy.weather.forecast}
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {selectedWeather.forecast.map((entry, entryIndex) => {
                    const barStyle = {
                      "--devdash-forecast-scale": (entry.temperature / weatherMaxTemp).toFixed(3),
                    } as CSSProperties;

                    return (
                      <li
                        key={`${selectedLocation.id}-${entryIndex}`}
                        className="rounded-xl border border-border bg-background/70 p-2 text-center"
                      >
                        <p className="text-[11px] text-muted">{entry.day}</p>
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
            </>
          )}
        </div>
      );
    }

    if (widgetId === "github") {
      return (
        <div className="space-y-4">
          <dl className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <dt className="text-[11px] tracking-[0.13em] text-muted uppercase">{copy.github.total}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {githubData?.publicRepos ?? "—"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <dt className="text-[11px] tracking-[0.13em] text-muted uppercase">{copy.github.activeDays}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {githubData?.recentRepos.length ?? "—"}
              </dd>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-3">
              <dt className="text-[11px] tracking-[0.13em] text-muted uppercase">{copy.github.streak}</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {githubData?.followers ?? "—"}
              </dd>
            </div>
          </dl>

          <div
            className="overflow-x-auto rounded-2xl border border-border bg-background/65 p-3"
            role="img"
            aria-label={
              localeKey === "de"
                ? `GitHub-Aktivität: ${githubData?.days.reduce((sum, day) => sum + day.count, 0) ?? 0} öffentliche Events in den letzten 90 Tagen`
                : `GitHub activity: ${githubData?.days.reduce((sum, day) => sum + day.count, 0) ?? 0} public events in the last 90 days`
            }
          >
            <div className="inline-grid grid-flow-col gap-1">
              {heatmap.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
                  {week.map((value, dayIndex) => (
                    <span
                      key={`day-${weekIndex}-${dayIndex}`}
                      className={`devdash-heat-cell level-${heatLevel(value)}`}
                      title={`${value} Events`}
                      aria-hidden="true"
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
                <span
                  key={`legend-${level}`}
                  className={`devdash-heat-cell level-${level}`}
                  aria-hidden="true"
                />
              ))}
              <span>{copy.github.intense}</span>
            </div>
          </div>

          {githubStatus === "ready" && githubData ? (
            <div className="rounded-2xl border border-border bg-background/65 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`https://github.com/${githubData.user}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-6 items-center font-mono text-xs font-semibold text-primary transition hover:opacity-80"
                >
                  @{githubData.user} ↗
                </a>
                <p className="text-xs text-muted">
                  {githubData.publicRepos} Repos · {githubData.followers} Follower
                </p>
              </div>

              {githubData.recentRepos.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {githubData.recentRepos.map((repo) => (
                    <li key={repo.name}>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="devdash-pill inline-flex rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] font-medium text-muted"
                      >
                        {repo.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted">
              {githubStatus === "error"
                ? localeKey === "de"
                  ? "GitHub-Daten aktuell nicht erreichbar — Beispieldaten werden angezeigt."
                  : "GitHub data currently unavailable — sample data is shown."
                : localeKey === "de"
                  ? "Lade öffentliche GitHub-Aktivität ..."
                  : "Loading public GitHub activity ..."}
            </p>
          )}
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

      const totalChars = notes.reduce((sum, note) => sum + note.length, 0);

      return (
        <div className="space-y-3">
          <button
            type="button"
            onClick={addNote}
            className="contact-submit inline-flex w-full items-center justify-center rounded-xl bg-primary-solid px-4 py-2.5 text-sm font-semibold text-white"
          >
            {copy.notes.addNote}
          </button>

          <div className="space-y-2.5">
            {notes.map((note, index) => {
              const noteId = `devdash-note-${index}`;

              return (
                <article key={noteId} className="rounded-2xl border border-border bg-background/65 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={noteId} className="text-xs font-semibold tracking-[0.11em] text-muted uppercase">
                      {copy.notes.noteLabel} {index + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteNote(index)}
                      aria-label={`${copy.notes.deleteNote} ${copy.notes.noteLabel} ${index + 1}`}
                      className="devdash-pill rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted"
                    >
                      {copy.notes.deleteNote}
                    </button>
                  </div>

                  <textarea
                    id={noteId}
                    value={note}
                    onChange={(event) => updateNote(index, event.target.value)}
                    placeholder={copy.notes.placeholder}
                    className="contact-field mt-2 min-h-[120px] w-full resize-y rounded-2xl px-3 py-2.5 text-sm leading-relaxed"
                  />
                </article>
              );
            })}
          </div>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">{copy.notes.templatesLabel}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {copy.notes.templates.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => insertTemplateIntoLatestNote(template)}
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
              {copy.notes.chars}: {totalChars}
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

        {newsStatus !== "ready" ? (
          <p className="rounded-2xl border border-border bg-background/70 p-3 text-xs text-muted">
            {newsStatus === "error"
              ? localeKey === "de"
                ? "News-Feed aktuell nicht erreichbar. Bitte später erneut versuchen."
                : "News feed currently unavailable. Please try again later."
              : localeKey === "de"
                ? "Lade Hacker-News-Feed ..."
                : "Loading Hacker News feed ..."}
          </p>
        ) : filteredNews.length === 0 ? (
          <p className="rounded-2xl border border-border bg-background/70 p-3 text-xs text-muted">
            {localeKey === "de"
              ? "In dieser Kategorie gibt es gerade keine Treffer."
              : "No stories in this category right now."}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredNews.map((entry) => (
              <li key={entry.id}>
                <article className="devdash-news-item rounded-2xl border border-border bg-background/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="break-all text-xs font-semibold text-muted">
                      {entry.source} · {entry.time}
                    </p>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-6 items-center text-xs font-semibold text-primary transition hover:opacity-80"
                    >
                      {copy.news.open} ↗
                    </a>
                  </div>
                  <h3 className="mt-1 break-words text-sm font-semibold text-foreground">{entry.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {entry.score} {localeKey === "de" ? "Punkte auf Hacker News" : "points on Hacker News"}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {copy.badge}
          </span>
          <Link
            href="/#projects"
            className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
          >
            ← {copy.back}
          </Link>
        </div>

        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
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
              {hasHydratedStorage
                ? new Intl.DateTimeFormat(intlLocale, {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Berlin",
                  }).format(new Date(now))
                : "—"}
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
