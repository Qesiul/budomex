"use client";

import Icon, { type OmsIconName } from "../../_components/Icon";
import { useOrders } from "../_hooks/useOrders";
import { useMonthlyStats } from "../_hooks/useMonthlyStats";

type StatColor = "danger" | "info" | "warning" | "purple";
type Trend = "up" | "down" | "flat";

type StatCard = {
  key: string;
  label: string;
  value: number | null;
  delta: string;
  trend: Trend;
  color: StatColor;
  icon: OmsIconName;
  urgent: boolean;
};

const trendIcon = (trend: Trend): OmsIconName =>
  trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "minus";
const deltaCls = (trend: Trend) =>
  trend === "up" ? "up" : trend === "down" ? "down" : "";

function computeMonthlyDelta(
  monthly: { name: string; zamowienia: number }[] | undefined,
): { delta: string; trend: Trend } {
  if (!monthly || monthly.length < 2) return { delta: "—", trend: "flat" };
  const currentIdx = new Date().getMonth();
  const current = monthly[currentIdx]?.zamowienia ?? 0;
  const prevIdx = (currentIdx + 11) % 12;
  const previous = monthly[prevIdx]?.zamowienia ?? 0;
  const diff = current - previous;
  if (diff === 0) return { delta: "bez zmian vs poprzedni mies.", trend: "flat" };
  const sign = diff > 0 ? "+" : "";
  return {
    delta: `${sign}${diff} vs poprzedni mies.`,
    trend: diff > 0 ? "up" : "down",
  };
}

export default function StatCards() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: monthly } = useMonthlyStats();

  const counts = {
    pending: orders?.countOczekujace ?? null,
    active: orders?.countWRealizacji ?? null,
    overdue: orders?.countOverdue ?? null,
    install: orders?.countMontaz ?? null,
  };

  const monthlyDelta = computeMonthlyDelta(monthly);

  const cards: StatCard[] = [
    {
      key: "pending",
      label: "Oczekujące zapytania",
      value: counts.pending,
      delta: counts.pending && counts.pending > 0 ? "wymagają wyceny" : "—",
      trend: "flat",
      color: "danger",
      icon: "inbox",
      urgent: (counts.pending ?? 0) > 0,
    },
    {
      key: "active",
      label: "W realizacji",
      value: counts.active,
      delta: monthlyDelta.delta,
      trend: monthlyDelta.trend,
      color: "info",
      icon: "activity",
      urgent: false,
    },
    {
      key: "overdue",
      label: "Przekroczony termin",
      value: counts.overdue,
      delta: counts.overdue && counts.overdue > 0 ? "wymaga reakcji" : "—",
      trend: "flat",
      color: "warning",
      icon: "alert-triangle",
      urgent: (counts.overdue ?? 0) > 0,
    },
    {
      key: "install",
      label: "W montażu",
      value: counts.install,
      delta: "—",
      trend: "flat",
      color: "purple",
      icon: "truck",
      urgent: false,
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((s) => (
        <button
          key={s.key}
          type="button"
          className={`kpi ${s.color}`}
          aria-label={`${s.label}: ${s.value ?? "ładowanie"}`}
        >
          <div className="kpi-head">
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-icon">
              <Icon name={s.icon} size={16} />
            </div>
          </div>
          <div className="kpi-value">
            {s.value == null ? (ordersLoading ? "…" : "—") : s.value}
            {s.urgent && (s.value ?? 0) > 0 && (
              <span className="pulse-dot" aria-hidden="true" />
            )}
          </div>
          <div className={`kpi-delta ${deltaCls(s.trend)}`}>
            <Icon name={trendIcon(s.trend)} size={11} />
            <span>{s.delta}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
