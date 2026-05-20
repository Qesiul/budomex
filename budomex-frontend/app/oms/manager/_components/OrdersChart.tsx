"use client";

import { useMemo, useState } from "react";
import { useMonthlyStats, type MonthlyStatsRow } from "../_hooks/useMonthlyStats";
import { useOrders, type BackendOrder } from "../_hooks/useOrders";
import { formatPrice } from "@/lib/format";

type Mode = "count" | "value";

const W = 720;
const H = 220;
const padding = { top: 16, right: 16, bottom: 28, left: 48 };
const innerW = W - padding.left - padding.right;
const innerH = H - padding.top - padding.bottom;

type ChartPoint = {
  month: string;
  count: number;
  value: number;
};

const MONTH_LABELS_PL = [
  "Sty",
  "Lut",
  "Mar",
  "Kwi",
  "Maj",
  "Cze",
  "Lip",
  "Sie",
  "Wrz",
  "Paź",
  "Lis",
  "Gru",
];

function buildChart(
  monthly: MonthlyStatsRow[] | undefined,
  orders: BackendOrder[] | undefined,
): ChartPoint[] {
  // Sum value per (year, month) from orders.submissionDate
  const valueByYM = new Map<string, number>();
  for (const o of orders ?? []) {
    if (o.status === "ANULOWANE") continue;
    if (o.price == null) continue;
    const d = new Date(o.submissionDate);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    valueByYM.set(key, (valueByYM.get(key) ?? 0) + Number(o.price));
  }

  // Rolling last 12 months ending current month (inclusive)
  const now = new Date();
  const points: ChartPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIdx = d.getMonth();
    const year = d.getFullYear();
    const ymKey = `${year}-${monthIdx}`;
    const value = valueByYM.get(ymKey) ?? 0;
    // count: backend monthly-stats is for current year only; use 0 for other years
    let count = 0;
    if (year === now.getFullYear() && monthly && monthly[monthIdx]) {
      count = monthly[monthIdx].zamowienia ?? 0;
    }
    points.push({
      month: MONTH_LABELS_PL[monthIdx],
      count,
      value,
    });
  }
  return points;
}

export default function OrdersChart() {
  const [mode, setMode] = useState<Mode>("count");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { data: monthly, isLoading: monthlyLoading } = useMonthlyStats();
  const { data: ordersResp } = useOrders();

  const data = useMemo(
    () => buildChart(monthly, ordersResp?.orders),
    [monthly, ordersResp],
  );

  const hasData = data.some((d) =>
    mode === "count" ? d.count > 0 : d.value > 0,
  );

  const values = data.map((d) => (mode === "count" ? d.count : d.value));
  const max = Math.max(...values, 1);
  const niceMax =
    mode === "count"
      ? Math.max(10, Math.ceil(max / 10) * 10)
      : Math.max(10_000, Math.ceil(max / 10_000) * 10_000);

  const barW = (innerW / data.length) * 0.62;
  const gap = innerW / data.length - barW;

  const yTicks = 4;
  const tickVals = Array.from(
    { length: yTicks + 1 },
    (_, i) => (niceMax * i) / yTicks,
  );

  const fmt = (v: number) =>
    mode === "count"
      ? String(Math.round(v))
      : v >= 1000
        ? `${(v / 1000).toFixed(0)}k`
        : String(Math.round(v));

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-head-left">
          <h3 className="card-title">Zamówienia w czasie</h3>
          <span className="card-sub">ostatnie 12 mies.</span>
        </div>
        <div className="seg" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "count"}
            className={`seg-btn ${mode === "count" ? "active" : ""}`}
            onClick={() => setMode("count")}
          >
            Liczba
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "value"}
            className={`seg-btn ${mode === "value" ? "active" : ""}`}
            onClick={() => setMode("value")}
          >
            Wartość · zł
          </button>
        </div>
      </div>
      <div className="chart-wrap">
        {monthlyLoading && !hasData ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Ładuję dane wykresu…
          </div>
        ) : !hasData ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "var(--text-dim)",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Brak danych do wyświetlenia w wybranym trybie.
          </div>
        ) : (
          <svg
            className="chart-svg"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Wykres zamówień miesięcznie"
          >
            {tickVals.map((t, i) => {
              const y = padding.top + innerH - (t / niceMax) * innerH;
              return (
                <g key={i}>
                  <line
                    className="chart-grid-line"
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerW}
                    y2={y}
                  />
                  <text
                    className="chart-axis-text"
                    x={padding.left - 6}
                    y={y + 3}
                    textAnchor="end"
                  >
                    {fmt(t)}
                  </text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const v = mode === "count" ? d.count : d.value;
              const h = (v / niceMax) * innerH;
              const x = padding.left + i * (innerW / data.length) + gap / 2;
              const y = padding.top + innerH - h;
              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    rx={2}
                    className="chart-bar"
                    fill={hoverIdx === i ? "var(--accent)" : undefined}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                  />
                  <text
                    className="chart-axis-text"
                    x={x + barW / 2}
                    y={H - 10}
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        {hoverIdx != null && hasData &&
          (() => {
            const d = data[hoverIdx];
            const x =
              padding.left +
              hoverIdx * (innerW / data.length) +
              gap / 2 +
              barW / 2;
            const leftPct = (x / W) * 100;
            return (
              <div
                className="chart-tooltip"
                style={{ left: `calc(${leftPct}% - 70px)`, top: 0 }}
              >
                <div className="tt-month">{d.month}</div>
                <div className="tt-row">
                  <span>Zamówienia</span>
                  <span>
                    <strong>{d.count}</strong>
                  </span>
                </div>
                <div className="tt-row">
                  <span>Wartość</span>
                  <span>
                    <strong>{formatPrice(d.value)}</strong>
                  </span>
                </div>
              </div>
            );
          })()}
      </div>
      <div className="chart-foot">
        {mode === "value"
          ? "Wartość liczona z aktualnych wycen — historyczne dane mogą być niepełne."
          : "Wykres nie uwzględnia zamówień anulowanych."}
      </div>
    </div>
  );
}
