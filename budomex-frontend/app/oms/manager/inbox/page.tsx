"use client";

import { useOrders } from "../_hooks/useOrders";
import OrdersListView from "../_components/OrdersListView";

export default function InboxPage() {
  const { data, isLoading } = useOrders();
  const count = data?.countOczekujace ?? 0;

  return (
    <>
      <header className="content-header">
        <div>
          <h1 className="content-title">Nowe zapytania</h1>
          <p className="content-sub">
            {isLoading
              ? "Ładuję zapytania…"
              : count === 0
                ? "Brak nowych zapytań. Wszystko wycenione."
                : `${count} ${count === 1 ? "zapytanie oczekuje" : "zapytań oczekuje"} na wycenę.`}
          </p>
        </div>
      </header>

      <OrdersListView
        statuses={["OCZEKUJACE"]}
        enableQuote
        emptyLabel="Brak nowych zapytań. Wszystko wycenione."
      />
    </>
  );
}
