"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";

type LocaleKey = "de" | "en";
type SortMode = "high" | "low";
type BudgetMode = "percent" | "euro";
type HouseholdMode = "single" | "pair";

type CityRentData = {
  id: string;
  city: string;
  state: string;
  rents: number[];
  medianNetIncome: number;
};

type DemoCopy = {
  badge: string;
  title: string;
  subtitle: string;
  back: string;
  chips: string[];
  cityList: {
    title: string;
    hint: string;
    selected: string;
    sortHigh: string;
    sortLow: string;
  };
  trend: {
    title: string;
    subtitle: string;
    currentRent: string;
    fiveYearChange: string;
    vsAverage: string;
    nationalAverage: string;
  };
  comparison: {
    title: string;
    subtitle: string;
    selectedBadge: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    cityLabel: string;
    apartmentSize: string;
    householdLabel: string;
    householdSingle: string;
    householdPair: string;
    budgetModeLabel: string;
    budgetModePercent: string;
    budgetModeEuro: string;
    budgetControlPercent: string;
    budgetControlEuro: string;
    budgetDecrease: string;
    budgetIncrease: string;
    netPerIncome: string;
    warmRent: string;
    coldRent: string;
    grossIncome: string;
    localMedian: string;
    affordability: string;
    statusRelaxed: string;
    statusBalanced: string;
    statusTight: string;
    note: string;
  };
  chartFooter: string;
  dataNote: string;
};

type MietpreiseTrackerDemoProps = {
  locale: string;
};

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const;
const INCIDENTAL_COST_PER_SQM = 3.2;

const CITY_RENT_DATA: CityRentData[] = [
  {
    id: "munich",
    city: "München",
    state: "Bayern",
    rents: [16.8, 17.6, 18.5, 19.3, 20.0, 20.6],
    medianNetIncome: 3450,
  },
  {
    id: "frankfurt",
    city: "Frankfurt am Main",
    state: "Hessen",
    rents: [13.1, 13.7, 14.3, 15.0, 15.5, 16.0],
    medianNetIncome: 3300,
  },
  {
    id: "stuttgart",
    city: "Stuttgart",
    state: "Baden-Württemberg",
    rents: [12.4, 13.0, 13.6, 14.1, 14.6, 15.1],
    medianNetIncome: 3200,
  },
  {
    id: "berlin",
    city: "Berlin",
    state: "Berlin",
    rents: [10.0, 10.6, 11.2, 11.8, 12.4, 13.0],
    medianNetIncome: 2850,
  },
  {
    id: "hamburg",
    city: "Hamburg",
    state: "Hamburg",
    rents: [11.0, 11.4, 11.9, 12.3, 12.7, 13.1],
    medianNetIncome: 3000,
  },
  {
    id: "cologne",
    city: "Köln",
    state: "Nordrhein-Westfalen",
    rents: [10.4, 10.9, 11.4, 11.8, 12.2, 12.6],
    medianNetIncome: 2900,
  },
  {
    id: "duesseldorf",
    city: "Düsseldorf",
    state: "Nordrhein-Westfalen",
    rents: [10.9, 11.3, 11.8, 12.2, 12.6, 12.9],
    medianNetIncome: 3050,
  },
  {
    id: "nuremberg",
    city: "Nürnberg",
    state: "Bayern",
    rents: [9.2, 9.6, 10.0, 10.4, 10.8, 11.2],
    medianNetIncome: 2800,
  },
  {
    id: "hannover",
    city: "Hannover",
    state: "Niedersachsen",
    rents: [8.2, 8.6, 9.0, 9.5, 10.0, 10.4],
    medianNetIncome: 2700,
  },
  {
    id: "leipzig",
    city: "Leipzig",
    state: "Sachsen",
    rents: [6.8, 7.2, 7.6, 8.0, 8.4, 8.8],
    medianNetIncome: 2500,
  },
  {
    id: "dresden",
    city: "Dresden",
    state: "Sachsen",
    rents: [7.1, 7.4, 7.8, 8.2, 8.6, 8.9],
    medianNetIncome: 2450,
  },
  {
    id: "dortmund",
    city: "Dortmund",
    state: "Nordrhein-Westfalen",
    rents: [6.9, 7.2, 7.5, 7.8, 8.1, 8.5],
    medianNetIncome: 2550,
  },
];

const COPY: Record<LocaleKey, DemoCopy> = {
  de: {
    badge: "Live-Demo · Mietdaten Deutschland",
    title: "Mietpreise-Tracker",
    subtitle:
      "Interaktiver Marktüberblick für deutsche Städte: Vergleich aktueller Mieten, Trendentwicklung seit 2020 und ein Rechner für das empfohlene Einkommen pro Haushalt.",
    back: "Zurück zur Startseite",
    chips: ["Städtevergleich", "Trend-Visualisierung", "Einkommens-Rechner"],
    cityList: {
      title: "Städte im Vergleich",
      hint: "Wählen Sie eine Stadt. Rechts sehen Sie sofort Verlauf, Benchmark und die Auswirkung auf das benötigte Einkommen.",
      selected: "Ausgewählt",
      sortHigh: "Teuerste zuerst",
      sortLow: "Günstigste zuerst",
    },
    trend: {
      title: "Miettrend pro m²",
      subtitle: "Kaltmiete pro Quadratmeter im Zeitverlauf",
      currentRent: "Aktuell",
      fiveYearChange: "Veränderung seit 2020",
      vsAverage: "Abweichung vom Städte-Schnitt",
      nationalAverage: "Städte-Schnitt",
    },
    comparison: {
      title: "Ranking nach Mietniveau",
      subtitle: "Jahreswert 2025 · Kaltmiete pro m²",
      selectedBadge: "Ihre Auswahl",
    },
    calculator: {
      title: "Wie viel Einkommen benötigen Sie?",
      subtitle:
        "Faustregel-Rechner für Ausbildung/Junior-Level: Warmmiete sollte je nach Sicherheitsniveau 30–40% des Nettohaushaltseinkommens ausmachen.",
      cityLabel: "Stadt",
      apartmentSize: "Wohnungsgröße",
      householdLabel: "Haushalt",
      householdSingle: "1 Einkommen",
      householdPair: "2 Einkommen",
      budgetModeLabel: "Budget-Modus",
      budgetModePercent: "%",
      budgetModeEuro: "€",
      budgetControlPercent: "Budget in % vom Nettohaushalt",
      budgetControlEuro: "Fixes Budget in €",
      budgetDecrease: "Budget verringern",
      budgetIncrease: "Budget erhöhen",
      netPerIncome: "Empfohlenes Netto je Einkommen",
      warmRent: "Geschätzte Warmmiete",
      coldRent: "Kaltmiete",
      grossIncome: "Grob geschätztes Brutto gesamt",
      localMedian: "Vergleich mit lokalem Median-Netto",
      affordability: "Marktlage",
      statusRelaxed: "Entspannt",
      statusBalanced: "Anspruchsvoll, aber realistisch",
      statusTight: "Angespannt",
      note: "Berechnung: Kaltmiete + pauschal 3,20 €/m² Nebenkosten. Brutto-Schätzung mit Faktor 1,45.",
    },
    chartFooter: "Linie: ausgewählte Stadt · gestrichelte Linie: Durchschnitt über alle Städte",
    dataNote:
      "Datenbasis: realitätsnahe Demo-Werte 2025 auf Basis öffentlich berichteter Angebotsmieten (u. a. ImmoScout24/Statista, kein Live-API).",
  },
  en: {
    badge: "Live demo · Germany rental data",
    title: "Rent Price Tracker",
    subtitle:
      "Interactive market view for German cities: compare current rents, inspect trend development since 2020 and estimate required household income.",
    back: "Back to homepage",
    chips: ["City comparison", "Trend visualization", "Income calculator"],
    cityList: {
      title: "City comparison",
      hint: "Pick a city. The right side updates trend, benchmark and income impact instantly.",
      selected: "Selected",
      sortHigh: "Highest first",
      sortLow: "Lowest first",
    },
    trend: {
      title: "Rent trend per m²",
      subtitle: "Cold rent per square meter over time",
      currentRent: "Current",
      fiveYearChange: "Change since 2020",
      vsAverage: "Difference vs city average",
      nationalAverage: "City average",
    },
    comparison: {
      title: "Ranking by rent level",
      subtitle: "2025 value · cold rent per m²",
      selectedBadge: "your selection",
    },
    calculator: {
      title: "How much income do you need?",
      subtitle:
        "Rule-of-thumb calculator for apprenticeship/junior level: warm rent should usually stay between 30–40% of net household income.",
      cityLabel: "City",
      apartmentSize: "Apartment size",
      householdLabel: "Household",
      householdSingle: "1 income",
      householdPair: "2 incomes",
      budgetModeLabel: "Budget mode",
      budgetModePercent: "%",
      budgetModeEuro: "€",
      budgetControlPercent: "Budget as % of net household income",
      budgetControlEuro: "Fixed budget in €",
      budgetDecrease: "Decrease budget",
      budgetIncrease: "Increase budget",
      netPerIncome: "Recommended net income per earner",
      warmRent: "Estimated warm rent",
      coldRent: "Cold rent",
      grossIncome: "Estimated gross household income",
      localMedian: "Compared to local median net income",
      affordability: "Market pressure",
      statusRelaxed: "Comfortable",
      statusBalanced: "Demanding but realistic",
      statusTight: "Tight",
      note: "Formula: cold rent + flat 3.20 €/m² utilities. Gross estimate uses 1.45 multiplier.",
    },
    chartFooter: "Solid line: selected city · dashed line: average of all cities",
    dataNote:
      "Dataset: realistic 2025 demo values based on publicly reported asking rents (e.g. ImmoScout24/Statista, no live API).",
  },
};

function getCurrentRent(city: CityRentData) {
  return city.rents[city.rents.length - 1] ?? 0;
}

function getPercentDelta(from: number, to: number) {
  if (from === 0) {
    return 0;
  }

  return ((to - from) / from) * 100;
}

function getLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function getAreaPath(points: Array<{ x: number; y: number }>, baselineY: number) {
  if (points.length === 0) {
    return "";
  }

  const linePath = getLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function formatEuro(value: number, localeTag: string, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits,
  }).format(value);
}

function formatPercent(value: number, localeTag: string) {
  return new Intl.NumberFormat(localeTag, {
    signDisplay: "always",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number, localeTag: string, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(localeTag, {
    maximumFractionDigits,
  }).format(value);
}

export function MietpreiseTrackerDemo({ locale }: MietpreiseTrackerDemoProps) {
  const localeKey: LocaleKey = locale === "de" ? "de" : "en";
  const localeTag = localeKey === "de" ? "de-DE" : "en-US";
  const copy = COPY[localeKey];

  const [selectedCityId, setSelectedCityId] = useState<string>("berlin");
  const [sortMode, setSortMode] = useState<SortMode>("high");
  const [apartmentSize, setApartmentSize] = useState<number>(55);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("percent");
  const [budgetPercent, setBudgetPercent] = useState<number>(35);
  const [customBudgetEuro, setCustomBudgetEuro] = useState<number>(1200);
  const [householdMode, setHouseholdMode] = useState<HouseholdMode>("single");

  const selectedCity =
    CITY_RENT_DATA.find((city) => city.id === selectedCityId) ?? CITY_RENT_DATA[0];

  const selectedCurrentRent = getCurrentRent(selectedCity);
  const selectedInitialRent = selectedCity.rents[0] ?? selectedCurrentRent;
  const selectedDelta = getPercentDelta(selectedInitialRent, selectedCurrentRent);

  const cityAverageTrend = useMemo(
    () =>
      YEARS.map((_, yearIndex) => {
        const total = CITY_RENT_DATA.reduce((sum, city) => sum + (city.rents[yearIndex] ?? 0), 0);
        return total / CITY_RENT_DATA.length;
      }),
    [],
  );

  const currentAverageRent = cityAverageTrend[cityAverageTrend.length - 1] ?? 0;
  const differenceToAverage = getPercentDelta(currentAverageRent, selectedCurrentRent);

  const sortedCities = useMemo(() => {
    const next = [...CITY_RENT_DATA];
    next.sort((a, b) => {
      const left = getCurrentRent(a);
      const right = getCurrentRent(b);
      return sortMode === "high" ? right - left : left - right;
    });
    return next;
  }, [sortMode]);

  const maxRentInList = useMemo(
    () => sortedCities.reduce((max, city) => Math.max(max, getCurrentRent(city)), 0),
    [sortedCities],
  );

  const chartPoints = useMemo(() => {
    const width = 640;
    const height = 260;
    const paddingX = 36;
    const paddingY = 24;

    const rangeMin = Math.min(...selectedCity.rents, ...cityAverageTrend) - 0.9;
    const rangeMax = Math.max(...selectedCity.rents, ...cityAverageTrend) + 0.9;
    const graphWidth = width - paddingX * 2;
    const graphHeight = height - paddingY * 2;

    const toX = (index: number) => paddingX + (graphWidth / (YEARS.length - 1)) * index;
    const toY = (value: number) => {
      if (rangeMax === rangeMin) {
        return height / 2;
      }
      return paddingY + ((rangeMax - value) / (rangeMax - rangeMin)) * graphHeight;
    };

    const city = selectedCity.rents.map((value, index) => ({
      x: toX(index),
      y: toY(value),
      value,
      year: YEARS[index],
    }));

    const average = cityAverageTrend.map((value, index) => ({
      x: toX(index),
      y: toY(value),
      value,
      year: YEARS[index],
    }));

    return {
      width,
      height,
      baselineY: height - paddingY,
      gridLines: 4,
      city,
      average,
      minValue: rangeMin,
      maxValue: rangeMax,
    };
  }, [cityAverageTrend, selectedCity.rents]);

  const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const updateApartmentSize = (value: string) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) {
      return;
    }

    setApartmentSize(clampValue(Math.round(nextValue), 25, 120));
  };

  const updateBudgetFromSlider = (value: string) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) {
      return;
    }

    if (budgetMode === "percent") {
      setBudgetPercent(clampValue(Math.round(nextValue), 20, 60));
      return;
    }

    const stepped = Math.round(nextValue / 50) * 50;
    setCustomBudgetEuro(clampValue(stepped, 500, 3000));
  };

  const adjustBudget = (direction: -1 | 1) => {
    if (budgetMode === "percent") {
      setBudgetPercent((previous) => clampValue(previous + direction, 20, 60));
      return;
    }

    setCustomBudgetEuro((previous) => clampValue(previous + direction * 50, 500, 3000));
  };

  const currentBudgetDisplay =
    budgetMode === "percent"
      ? `${formatNumber(budgetPercent, localeTag, 0)}%`
      : `${formatNumber(customBudgetEuro, localeTag, 0)} €`;

  const coldRent = selectedCurrentRent * apartmentSize;
  const warmRent = coldRent + apartmentSize * INCIDENTAL_COST_PER_SQM;
  const requiredNetIncome =
    budgetMode === "percent" ? warmRent / (budgetPercent / 100) : customBudgetEuro;
  const requiredGrossIncome = requiredNetIncome * 1.45;

  const incomesCount = householdMode === "single" ? 1 : 2;
  const netIncomePerSource = requiredNetIncome / incomesCount;
  const localMedianPerSource = selectedCity.medianNetIncome / incomesCount;
  const affordabilityFactor = localMedianPerSource > 0 ? netIncomePerSource / localMedianPerSource : 0;

  const affordabilityStatus =
    affordabilityFactor <= 0.85
      ? copy.calculator.statusRelaxed
      : affordabilityFactor <= 1.05
        ? copy.calculator.statusBalanced
        : copy.calculator.statusTight;

  const medianComparisonHint =
    localeKey === "de"
      ? "vom lokalen Median-Netto je Einkommen"
      : "of local median net income per earner";

  const cityPath = getLinePath(chartPoints.city);
  const cityAreaPath = getAreaPath(chartPoints.city, chartPoints.baselineY);
  const averagePath = getLinePath(chartPoints.average);
  const trendChartLabel =
    localeKey === "de"
      ? `Mietpreistrend für ${selectedCity.city}`
      : `Rent trend for ${selectedCity.city}`;

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
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{copy.cityList.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{copy.cityList.hint}</p>
            </div>

            <div className="flex w-full items-center gap-2 rounded-full border border-border bg-background/80 p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setSortMode("high")}
                aria-pressed={sortMode === "high"}
                className={`rent-pill flex-1 rounded-full px-3 py-1 text-center text-xs font-semibold sm:flex-none ${
                  sortMode === "high"
                    ? "bg-primary-solid text-white"
                    : "text-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {copy.cityList.sortHigh}
              </button>
              <button
                type="button"
                onClick={() => setSortMode("low")}
                aria-pressed={sortMode === "low"}
                className={`rent-pill flex-1 rounded-full px-3 py-1 text-center text-xs font-semibold sm:flex-none ${
                  sortMode === "low"
                    ? "bg-primary-solid text-white"
                    : "text-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {copy.cityList.sortLow}
              </button>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {sortedCities.map((city) => {
              const currentRent = getCurrentRent(city);
              const isActive = city.id === selectedCity.id;
              const cityDelta = getPercentDelta(city.rents[0] ?? currentRent, currentRent);

              return (
                <li key={city.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCityId(city.id)}
                    aria-pressed={isActive}
                    className={`rent-city-button w-full rounded-2xl border p-3 text-left ${
                      isActive
                        ? "is-active border-primary/45 bg-primary/10"
                        : "border-border bg-background/75"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{city.city}</p>
                        <p className="text-xs text-muted">{city.state}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatEuro(currentRent, localeTag, 1)}/m²
                        </p>
                        <p className="text-xs text-muted">{formatPercent(cityDelta, localeTag)}%</p>
                      </div>
                    </div>

                    {isActive ? (
                      <p className="mt-2 text-[11px] font-semibold tracking-[0.13em] text-primary uppercase">
                        {copy.cityList.selected}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-4">
          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">{copy.trend.title}</h3>
            <p className="mt-1 text-sm text-muted">{copy.trend.subtitle}</p>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                  {copy.trend.currentRent}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {formatEuro(selectedCurrentRent, localeTag, 1)}/m²
                </dd>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                  {copy.trend.fiveYearChange}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {formatPercent(selectedDelta, localeTag)}%
                </dd>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                  {copy.trend.vsAverage}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-foreground">
                  {formatPercent(differenceToAverage, localeTag)}%
                </dd>
              </div>
            </dl>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background/65 p-3 sm:p-4">
              <svg
                viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
                className="h-auto w-full"
                role="img"
                aria-label={trendChartLabel}
              >
                <defs>
                  <linearGradient id="rent-area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(59 130 246 / 0.24)" />
                    <stop offset="100%" stopColor="rgb(59 130 246 / 0)" />
                  </linearGradient>
                </defs>

                {Array.from({ length: chartPoints.gridLines + 1 }).map((_, index) => {
                  const y =
                    24 +
                    ((chartPoints.height - 48) / chartPoints.gridLines) *
                      index;

                  return (
                    <line
                      key={`grid-${index}`}
                      x1="36"
                      x2={chartPoints.width - 36}
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.12"
                    />
                  );
                })}

                <path d={cityAreaPath} fill="url(#rent-area-gradient)" />
                <path
                  d={averagePath}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.4"
                  strokeDasharray="6 6"
                  strokeWidth="2"
                />
                <path d={cityPath} fill="none" stroke="rgb(59 130 246)" strokeWidth="2.8" />

                {chartPoints.city.map((point, index) => {
                  const delayStyle = {
                    "--rent-point-delay": `${index * 70}ms`,
                  } as CSSProperties;

                  return (
                    <g key={`${selectedCity.id}-${point.year}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4.4"
                        className="rent-trend-point"
                        style={delayStyle}
                        fill="rgb(16 185 129)"
                      />
                      <text
                        x={point.x}
                        y={chartPoints.height - 8}
                        textAnchor="middle"
                        fill="currentColor"
                        fillOpacity="0.58"
                        fontSize="11"
                        className="font-mono"
                      >
                        {point.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="mt-3 text-xs text-muted">
              {copy.chartFooter} · {copy.trend.nationalAverage}: {formatEuro(currentAverageRent, localeTag, 1)}/m²
            </p>
          </article>

          <article className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <h3 className="text-base font-semibold tracking-tight">{copy.comparison.title}</h3>
            <p className="mt-1 text-sm text-muted">{copy.comparison.subtitle}</p>

            <ul className="mt-4 space-y-3">
              {sortedCities.map((city, index) => {
                const currentRent = getCurrentRent(city);
                const scale = maxRentInList > 0 ? currentRent / maxRentInList : 0;
                const isSelected = city.id === selectedCity.id;
                const barStyle = {
                  "--rent-bar-scale": scale.toFixed(4),
                } as CSSProperties;

                return (
                  <li key={`${city.id}-bar`} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <p className="font-medium text-foreground">
                        {String(index + 1).padStart(2, "0")}. {city.city}
                      </p>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {isSelected ? (
                          <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                            {copy.comparison.selectedBadge}
                          </span>
                        ) : null}
                        <span className="font-semibold text-foreground">
                          {formatEuro(currentRent, localeTag, 1)}/m²
                        </span>
                      </div>
                    </div>

                    <div className="rent-bar-track">
                      <span className="rent-bar-fill is-visible" style={barStyle} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </article>
        </section>
      </div>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{copy.calculator.title}</h2>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">{copy.calculator.subtitle}</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="rounded-2xl border border-border bg-background/75 p-4 sm:p-5">
            <label className="block text-sm font-semibold text-foreground">
              {copy.calculator.cityLabel}
              <select
                value={selectedCity.id}
                onChange={(event) => setSelectedCityId(event.target.value)}
                className="contact-field mt-2 w-full rounded-2xl px-3 py-2.5 text-sm"
              >
                {CITY_RENT_DATA.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-2 text-sm">
                <label htmlFor="rent-size" className="font-semibold text-foreground">
                  {copy.calculator.apartmentSize}
                </label>
                <span className="font-mono text-muted">{apartmentSize} m²</span>
              </div>
              <input
                id="rent-size"
                type="range"
                min={25}
                max={120}
                step={1}
                value={apartmentSize}
                onInput={(event) => updateApartmentSize(event.currentTarget.value)}
                onChange={(event) => updateApartmentSize(event.currentTarget.value)}
                className="rent-slider mt-3 h-2 w-full cursor-pointer"
              />
            </div>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-foreground">{copy.calculator.householdLabel}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setHouseholdMode("single")}
                  aria-pressed={householdMode === "single"}
                  className={`rent-pill rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    householdMode === "single"
                      ? "border-primary/40 bg-primary/12 text-primary"
                      : "border-border bg-card text-muted hover:border-primary/35 hover:text-primary"
                  }`}
                >
                  {copy.calculator.householdSingle}
                </button>
                <button
                  type="button"
                  onClick={() => setHouseholdMode("pair")}
                  aria-pressed={householdMode === "pair"}
                  className={`rent-pill rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    householdMode === "pair"
                      ? "border-primary/40 bg-primary/12 text-primary"
                      : "border-border bg-card text-muted hover:border-primary/35 hover:text-primary"
                  }`}
                >
                  {copy.calculator.householdPair}
                </button>
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-foreground">{copy.calculator.budgetModeLabel}</legend>

              <div className="mt-2 flex items-center gap-2 rounded-full border border-border bg-card p-1">
                <button
                  type="button"
                  onClick={() => setBudgetMode("percent")}
                  aria-pressed={budgetMode === "percent"}
                  className={`rent-pill flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    budgetMode === "percent"
                      ? "bg-primary-solid text-white"
                      : "text-muted hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {copy.calculator.budgetModePercent}
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetMode("euro")}
                  aria-pressed={budgetMode === "euro"}
                  className={`rent-pill flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    budgetMode === "euro"
                      ? "bg-primary-solid text-white"
                      : "text-muted hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {copy.calculator.budgetModeEuro}
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-border bg-card/70 p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <label htmlFor="budget-slider" className="font-semibold text-foreground">
                    {budgetMode === "percent"
                      ? copy.calculator.budgetControlPercent
                      : copy.calculator.budgetControlEuro}
                  </label>
                  <span className="font-mono text-muted">{currentBudgetDisplay}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustBudget(-1)}
                    aria-label={copy.calculator.budgetDecrease}
                    className="rent-pill inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-sm font-semibold text-muted transition hover:border-primary/35 hover:text-primary"
                  >
                    −
                  </button>
                  <input
                    id="budget-slider"
                    type="range"
                    min={budgetMode === "percent" ? 20 : 500}
                    max={budgetMode === "percent" ? 60 : 3000}
                    step={budgetMode === "percent" ? 1 : 50}
                    value={budgetMode === "percent" ? budgetPercent : customBudgetEuro}
                    onInput={(event) => updateBudgetFromSlider(event.currentTarget.value)}
                    onChange={(event) => updateBudgetFromSlider(event.currentTarget.value)}
                    className="rent-slider h-2 w-full cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => adjustBudget(1)}
                    aria-label={copy.calculator.budgetIncrease}
                    className="rent-pill inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 text-sm font-semibold text-muted transition hover:border-primary/35 hover:text-primary"
                  >
                    +
                  </button>
                </div>

                {budgetMode === "percent" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[35, 40, 45, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudgetPercent(preset)}
                        aria-pressed={budgetPercent === preset}
                        className={`rent-pill rounded-xl border px-2.5 py-1.5 text-xs font-semibold ${
                          budgetPercent === preset
                            ? "border-primary/40 bg-primary/12 text-primary"
                            : "border-border bg-background/80 text-muted hover:border-primary/35 hover:text-primary"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </fieldset>
          </article>

          <article className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/75 p-4">
              <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                {copy.calculator.netPerIncome}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-foreground">
                {formatEuro(netIncomePerSource, localeTag)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/75 p-4">
              <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                {copy.calculator.warmRent}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-foreground">
                {formatEuro(warmRent, localeTag)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/75 p-4">
              <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                {copy.calculator.coldRent}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-foreground">
                {formatEuro(coldRent, localeTag)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/75 p-4">
              <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                {copy.calculator.grossIncome}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-foreground">
                {formatEuro(requiredGrossIncome, localeTag)}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/75 p-4 sm:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.13em] text-muted uppercase">
                {copy.calculator.localMedian}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">
                {formatEuro(netIncomePerSource, localeTag)} / {formatEuro(localMedianPerSource, localeTag)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatNumber(affordabilityFactor * 100, localeTag, 1)}% {medianComparisonHint}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/28 bg-primary/10 p-4 sm:col-span-2">
              <p className="text-[11px] font-semibold tracking-[0.13em] text-primary uppercase">
                {copy.calculator.affordability}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-foreground">{affordabilityStatus}</p>
              <p className="mt-1 text-xs text-muted">{copy.calculator.note}</p>
            </div>
          </article>
        </div>
      </section>

      <p className="mt-5 text-xs leading-relaxed text-muted">{copy.dataNote}</p>
    </main>
  );
}
