"use client";

import dynamic from "next/dynamic";

type ClientDemoProps = {
  slug: "ki-bewerbungshelfer" | "mietpreise-tracker" | "smartchat" | "devdash";
  locale: string;
};

/**
 * The interactive demos are mounted client-side only. Browser extensions
 * (wallets, AI helpers, translators) mutate the server-rendered HTML before
 * React hydrates it, which silently killed hydration of exactly this subtree
 * in real-world profiles — a client-only mount is immune to that.
 */
function DemoSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14" aria-busy="true">
      <div className="h-64 animate-pulse rounded-3xl border border-border bg-card" />
    </div>
  );
}

const KIBewerbungshelferDemo = dynamic(
  () => import("@/components/ki-bewerbungshelfer-demo").then((m) => m.KIBewerbungshelferDemo),
  { ssr: false, loading: DemoSkeleton },
);
const MietpreiseTrackerDemo = dynamic(
  () => import("@/components/mietpreise-tracker-demo").then((m) => m.MietpreiseTrackerDemo),
  { ssr: false, loading: DemoSkeleton },
);
const SmartChatDemo = dynamic(
  () => import("@/components/smartchat-demo").then((m) => m.SmartChatDemo),
  { ssr: false, loading: DemoSkeleton },
);
const DevDashDemo = dynamic(
  () => import("@/components/devdash-demo").then((m) => m.DevDashDemo),
  { ssr: false, loading: DemoSkeleton },
);

export function ClientDemo({ slug, locale }: ClientDemoProps) {
  switch (slug) {
    case "ki-bewerbungshelfer":
      return <KIBewerbungshelferDemo locale={locale} />;
    case "mietpreise-tracker":
      return <MietpreiseTrackerDemo locale={locale} />;
    case "smartchat":
      return <SmartChatDemo locale={locale} />;
    case "devdash":
      return <DevDashDemo locale={locale} />;
  }
}
