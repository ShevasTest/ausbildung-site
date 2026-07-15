import { NextResponse } from "next/server";

const GITHUB_USER = "ShevasTest";
const CACHE_TTL_MS = 15 * 60 * 1000;
const EVENT_PAGES = 3;

type GithubActivity = {
  user: string;
  days: Array<{ date: string; count: number }>;
  followers: number;
  publicRepos: number;
  recentRepos: Array<{ name: string; url: string; pushedAt: string }>;
  fetchedAt: number;
};

let cache: GithubActivity | null = null;

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "oleksandr-shevchenko-portfolio",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchActivity(): Promise<GithubActivity | null> {
  const [userResponse, reposResponse, ...eventResponses] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USER}`, { headers: githubHeaders() }),
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=pushed&per_page=5`, {
      headers: githubHeaders(),
    }),
    ...Array.from({ length: EVENT_PAGES }, (_, page) =>
      fetch(
        `https://api.github.com/users/${GITHUB_USER}/events/public?per_page=100&page=${page + 1}`,
        { headers: githubHeaders() },
      ),
    ),
  ]);

  if (!userResponse.ok) {
    return null;
  }

  const user = (await userResponse.json()) as { followers?: number; public_repos?: number };

  const repos = reposResponse.ok
    ? ((await reposResponse.json()) as Array<{
        name?: string;
        html_url?: string;
        pushed_at?: string;
        fork?: boolean;
      }>)
    : [];

  const counts = new Map<string, number>();
  for (const response of eventResponses) {
    if (!response.ok) {
      continue;
    }

    const events = (await response.json()) as Array<{ created_at?: string }>;
    for (const event of events) {
      if (!event.created_at) {
        continue;
      }

      const date = event.created_at.slice(0, 10);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
  }

  // 13 weeks (91 days) — the public events feed reaches back about 90 days.
  const days: GithubActivity["days"] = [];
  const today = new Date();
  for (let offset = 90; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const iso = day.toISOString().slice(0, 10);
    days.push({ date: iso, count: counts.get(iso) ?? 0 });
  }

  return {
    user: GITHUB_USER,
    days,
    followers: user.followers ?? 0,
    publicRepos: user.public_repos ?? 0,
    recentRepos: repos
      .filter((repo) => repo.name && repo.html_url)
      .slice(0, 4)
      .map((repo) => ({
        name: repo.name as string,
        url: repo.html_url as string,
        pushedAt: repo.pushed_at ?? "",
      })),
    fetchedAt: Date.now(),
  };
}

export async function GET() {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cache, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" },
    });
  }

  try {
    const activity = await fetchActivity();
    if (!activity) {
      return NextResponse.json({ error: "unavailable" }, { status: 502 });
    }

    cache = activity;
    return NextResponse.json(activity, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" },
    });
  } catch {
    if (cache) {
      return NextResponse.json(cache);
    }

    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
}
