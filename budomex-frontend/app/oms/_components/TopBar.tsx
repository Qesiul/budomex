"use client";

import Icon from "./Icon";
import UserMenu from "./UserMenu";
import TopBarSearch from "../manager/_components/TopBarSearch";
import NotificationsMenu from "../manager/_components/NotificationsMenu";
import type { Role } from "./OmsShell";
import type { AuthUser } from "@/lib/auth";

type Props = {
  role: Role;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  user: AuthUser;
  onLogout: () => void;
};

const ROLE_META: Record<
  Role,
  { chipLabel: string; searchPlaceholder: string }
> = {
  manager: {
    chipLabel: "MANAGER",
    searchPlaceholder: "Szukaj po numerze lub kliencie…",
  },
  worker: {
    chipLabel: "PRACOWNIK",
    searchPlaceholder: "Szukaj zamówienia…",
  },
};

function initialsFor(user: AuthUser): string {
  const first = user.firstName?.trim()?.[0];
  const last = user.lastName?.trim()?.[0];
  if (first && last) return `${first}${last}`.toUpperCase();
  if (first) return first.toUpperCase();
  return user.username.slice(0, 2).toUpperCase();
}

export default function TopBar({
  role,
  theme,
  onToggleTheme,
  user,
  onLogout,
}: Props) {
  const meta = ROLE_META[role];
  const initials = initialsFor(user);

  return (
    <header className="topbar">
      {role === "manager" ? (
        <TopBarSearch placeholder={meta.searchPlaceholder} />
      ) : (
        <div
          className="search"
          onClick={(e) => {
            e.currentTarget.querySelector("input")?.focus();
          }}
        >
          <Icon name="search" size={14} />
          <input
            type="text"
            placeholder={meta.searchPlaceholder}
            aria-label="Wyszukiwanie"
          />
        </div>
      )}

      <div className="tb-spacer" />

      <div className="live-status" aria-label="Status połączenia">
        <span className="live-dot" />
        <span>System aktywny</span>
      </div>

      {role === "manager" ? (
        <NotificationsMenu />
      ) : (
        <button
          type="button"
          className="icon-btn"
          aria-label="Powiadomienia"
          title="Powiadomienia"
        >
          <Icon name="bell" size={17} />
        </button>
      )}

      <UserMenu
        user={user}
        chipLabel={meta.chipLabel}
        initials={initials}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
      />
    </header>
  );
}
