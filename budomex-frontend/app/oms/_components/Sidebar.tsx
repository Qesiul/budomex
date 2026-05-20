"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Icon, { type OmsIconName } from "./Icon";
import type { Role } from "./OmsShell";

type NavItem = {
  key: string;
  label: string;
  icon: OmsIconName;
  href: string;
  badge?: number;
  badgeMuted?: number;
};

const MANAGER_NAV: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "layout-dashboard", href: "/oms/manager" },
  { key: "inbox", label: "Nowe zapytania", icon: "inbox", href: "/oms/manager/inbox", badge: 3 },
  { key: "orders", label: "Zamówienia", icon: "clipboard-list", href: "/oms/manager/orders", badgeMuted: 27 },
  { key: "production", label: "Produkcja", icon: "hammer", href: "/oms/manager/production", badgeMuted: 12 },
  { key: "install", label: "Montaż", icon: "truck", href: "/oms/manager/install", badgeMuted: 8 },
  { key: "workers", label: "Pracownicy", icon: "users", href: "/oms/manager/workers" },
  { key: "archive", label: "Archiwum", icon: "archive", href: "/oms/manager/archive" },
];

const WORKER_NAV: NavItem[] = [
  { key: "tasks", label: "Moje zadania", icon: "layout-grid", href: "/oms/worker" },
  { key: "backlog", label: "Backlog", icon: "inbox", href: "/oms/worker/backlog", badge: 3 },
  { key: "history", label: "Historia", icon: "history", href: "/oms/worker/history", badgeMuted: 47 },
  { key: "profile", label: "Profil", icon: "user", href: "/oms/worker/profile" },
];

type WorkerOrder = {
  id: string;
  product: string;
  pct: number;
  deadline: string;
  rel: string;
  priority: boolean;
  active: boolean;
  state: "normal" | "late";
};

const MY_ORDERS: WorkerOrder[] = [
  { id: "BMX-2025-0234", product: "5× Okno PCV", pct: 65, deadline: "23.05", rel: "za 3 dni", priority: false, active: true, state: "normal" },
  { id: "BMX-2025-0231", product: "9× Roleta zewnętrzna", pct: 35, deadline: "03.06", rel: "za 14 dni", priority: true, active: false, state: "normal" },
  { id: "BMX-2025-0227", product: "2× Okno PCV 1450", pct: 80, deadline: "28.05", rel: "za 8 dni", priority: false, active: false, state: "normal" },
  { id: "BMX-2025-0223", product: "Brama segm. + aut.", pct: 50, deadline: "21.05", rel: "PRZETERMINOWANE", priority: true, active: false, state: "late" },
  { id: "BMX-2025-0219", product: "Drzwi + naświetla", pct: 90, deadline: "26.05", rel: "za 6 dni", priority: false, active: false, state: "normal" },
  { id: "BMX-2025-0215", product: "4× Okno alu.", pct: 15, deadline: "12.06", rel: "za 23 dni", priority: false, active: false, state: "normal" },
];

const ACTIVE_ORDER_ID = "BMX-2025-0234";

function NavLinks({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string | null;
}) {
  return (
    <>
      {items.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={it.key}
            href={it.href}
            className={`sb-link ${active ? "active" : ""} ${
              it.badgeMuted != null ? "muted-badge" : ""
            }`}
          >
            <Icon name={it.icon} size={18} />
            <span>{it.label}</span>
            {it.badge != null && it.badge > 0 && (
              <span className="sb-badge accent">{it.badge}</span>
            )}
            {it.badgeMuted != null && it.badgeMuted > 0 && (
              <span className="sb-badge">{it.badgeMuted}</span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function ManagerExtras({ pathname }: { pathname: string | null }) {
  const settingsActive = pathname === "/oms/manager/settings";
  return (
    <>
      <div className="sb-separator" />
      <nav className="sb-nav" aria-label="Pozostałe">
        <Link
          href="/oms/manager/settings"
          className={`sb-link ${settingsActive ? "active" : ""}`}
        >
          <Icon name="settings" size={18} />
          <span>Ustawienia</span>
        </Link>
      </nav>
      <div className="sb-foot" />
    </>
  );
}

function WorkerExtras() {
  return (
    <>
      <div className="sb-section-label">
        <span>Moje zamówienia</span>
        <span className="count-pill">{MY_ORDERS.length}</span>
      </div>

      <div className="sb-orders">
        {MY_ORDERS.map((o) => (
          <button
            type="button"
            key={o.id}
            className={`sb-order ${o.id === ACTIVE_ORDER_ID ? "active" : ""} ${o.state === "late" ? "late" : ""}`}
          >
            <div className="sb-order-top">
              <span className="sb-order-num">{o.id}</span>
              {o.priority && <span className="sb-priority" title="Pilne" />}
            </div>
            <div className="sb-order-product">{o.product}</div>
            <div className="sb-order-bar">
              <div className="sb-order-bar-fill" style={{ width: `${o.pct}%` }} />
            </div>
            <div className="sb-order-meta">
              <span>
                {o.pct}% · {o.deadline}
              </span>
              {o.state === "late" ? (
                <span className="late">{o.rel}</span>
              ) : o.priority ? (
                <span className="urgent">{o.rel}</span>
              ) : (
                <span>{o.rel}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <button type="button" className="sb-foot-link">
        Zobacz wszystkie · w tym ukończone
        <Icon name="arrow-right" size={11} />
      </button>
    </>
  );
}

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const isWorker = role === "worker";
  const navItems = isWorker ? WORKER_NAV : MANAGER_NAV;

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-mark" aria-hidden="true" />
        <div>
          <div className="sb-wordmark">BUDOMEX</div>
          <div className="sb-sub">
            {isWorker ? "PANEL PRACOWNIKA" : "PANEL MANAGERA"}
          </div>
        </div>
      </div>

      <nav className="sb-nav" aria-label="Główna nawigacja">
        <NavLinks items={navItems} pathname={pathname} />
      </nav>

      {isWorker ? <WorkerExtras /> : <ManagerExtras pathname={pathname} />}
    </aside>
  );
}
