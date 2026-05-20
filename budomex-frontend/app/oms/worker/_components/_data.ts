import type { OmsIconName } from "../../_components/Icon";

export type StatusBadgeMeta = { cls: string; label: string };
export type Urgency = "green" | "amber" | "red";

export type OrderDetails = {
  product: string;
  quantity: string;
  dimensions: string;
  color: string;
  material: string;
  glass: string;
  notes: string;
};

export type CurrentOrder = {
  id: string;
  client: string;
  status: StatusBadgeMeta;
  priority: boolean;
  assignedAt: string;
  assignedBy: string;
  deadline: string;
  rel: string;
  urgency: Urgency;
  details: OrderDetails;
};

export type Task = {
  id: string;
  name: string;
  desc?: string;
  done: boolean;
  doneTime?: string;
  est: string;
  active?: boolean;
};

export type TaskSection = {
  id: string;
  title: string;
  estimate: string;
  tasks: Task[];
};

export type Note = {
  id: string;
  author: string;
  initials: string;
  mine: boolean;
  time: string;
  body: string;
};

export type TimelineState = "done" | "current" | "pending";

export type TimelineStep = {
  state: TimelineState;
  label: string;
  date: string;
  icon: OmsIconName | null;
};

export const CURRENT_ORDER: CurrentOrder = {
  id: "BMX-2025-0234",
  client: "Anna · Toruń",
  status: { cls: "info", label: "W produkcji" },
  priority: false,
  assignedAt: "18.05.2026",
  assignedBy: "Łukasz Wiśniewski",
  deadline: "23.05.2026",
  rel: "za 3 dni",
  urgency: "amber",
  details: {
    product: "Okno PCV",
    quantity: "5 sztuk",
    dimensions: "1200 × 1500 mm",
    color: "Biały RAL 9016",
    material: "PCV 6-komorowy, Veka Softline 82",
    glass: "Trzyszybowe 4/16/4/16/4 · Ug 0.5",
    notes:
      "Klamka antywłamaniowa Hoppe, mikrowentylacja standardowa, listwy podparapetowe białe.",
  },
};

export const INITIAL_SECTIONS: TaskSection[] = [
  {
    id: "prep",
    title: "Przygotowanie materiałów",
    estimate: "~2h",
    tasks: [
      { id: "t1", name: "Cięcie profili PCV na wymiar", desc: "5× rama 1200×1500 + skrzydła", done: true, doneTime: "18.05 · 09:12", est: "45 min" },
      { id: "t2", name: "Cięcie wzmocnień stalowych", desc: "Cynkowane, sekcja obwodowa", done: true, doneTime: "18.05 · 10:34", est: "30 min" },
      { id: "t3", name: "Cięcie szkła pakietowego", desc: "Trzyszybowe 4/16/4/16/4", done: true, doneTime: "18.05 · 12:08", est: "40 min" },
      { id: "t4", name: "Cięcie uszczelek EPDM", desc: "Czarne, 6 mm", done: true, doneTime: "18.05 · 13:22", est: "20 min" },
    ],
  },
  {
    id: "frame",
    title: "Produkcja ram",
    estimate: "~3h",
    tasks: [
      { id: "t5", name: "Zgrzewanie naroży ram", desc: "Temp. 240°C · czas 35s", done: true, doneTime: "18.05 · 15:01", est: "60 min" },
      { id: "t6", name: "Frezowanie odwodnień", desc: "3 otwory na ramę", done: true, doneTime: "18.05 · 16:18", est: "30 min" },
      { id: "t7", name: "Montaż okuć obwodowych", desc: "Maco Multi-Matic", done: true, doneTime: "19.05 · 09:45", est: "45 min" },
      { id: "t8", name: "Wstawianie wzmocnień stalowych", done: true, doneTime: "19.05 · 11:00", est: "30 min" },
      { id: "t9", name: "Czyszczenie spoin po zgrzewaniu", desc: "Frezarka CNC + ręczne wykończenie", done: false, active: true, est: "30 min" },
    ],
  },
  {
    id: "assembly",
    title: "Montaż okien",
    estimate: "~3h",
    tasks: [
      { id: "t10", name: "Szklenie pakietami", desc: "Klocowanie obwodowe", done: true, doneTime: "19.05 · 14:30", est: "50 min" },
      { id: "t11", name: "Montaż uszczelek przyszybowych", done: true, doneTime: "19.05 · 15:42", est: "25 min" },
      { id: "t12", name: "Montaż klamek (Hoppe Atlanta)", desc: "5× klamka antywłamaniowa", done: true, doneTime: "19.05 · 16:30", est: "20 min" },
      { id: "t13", name: "Montaż mikrowentylacji", desc: "Standardowa, w skrzydle", done: true, doneTime: "20.05 · 08:15", est: "30 min" },
      { id: "t14", name: "Regulacja okuć i skrzydeł", desc: "Test otwarcia · uchył · rozwarcie", done: false, est: "40 min" },
      { id: "t15", name: "Montaż listew podparapetowych", desc: "5× biała, klejona", done: false, est: "25 min" },
    ],
  },
  {
    id: "qc",
    title: "Kontrola jakości",
    estimate: "~1.5h",
    tasks: [
      { id: "t16", name: "Test szczelności (klasa 4)", desc: "Pompa pomiarowa · 600 Pa", done: true, doneTime: "20.05 · 11:24", est: "20 min" },
      { id: "t17", name: "Test wodoszczelności (klasa 9A)", done: false, est: "20 min" },
      { id: "t18", name: "Kontrola wizualna szyb", desc: "Rysy, zabrudzenia, kondensat", done: false, est: "15 min" },
      { id: "t19", name: "Kontrola pasowania skrzydeł", done: false, est: "20 min" },
      { id: "t20", name: "Etykietowanie i pakowanie", desc: "Folia stretch + narożniki", done: false, est: "25 min" },
    ],
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: "n1",
    author: "Marcel Żyta",
    initials: "MŻ",
    mine: true,
    time: "18.05 · 14:22",
    body:
      "Pakiet szybowy nr 3 miał lekkie pęknięcie na rogu — zamieniony na zapas z magazynu (paleta B-2). Reszta bez uwag.",
  },
  {
    id: "n2",
    author: "Łukasz Wiśniewski",
    initials: "ŁW",
    mine: false,
    time: "19.05 · 08:05",
    body:
      "Klientka prosi, żeby kierunek otwierania w oknie kuchennym (poz. 3) był odwrócony. Skoryguj przed zgrzewaniem — dzięki.",
  },
  {
    id: "n3",
    author: "Marcel Żyta",
    initials: "MŻ",
    mine: true,
    time: "19.05 · 09:32",
    body:
      "Skorygowane. Okno kuchenne (poz. 3) — otwarcie lewe, zgodnie z prośbą.",
  },
];

export const TIMELINE: TimelineStep[] = [
  { state: "done", label: "Przyjęte", date: "15.05", icon: "check" },
  { state: "done", label: "Zaakceptowane", date: "17.05", icon: "check" },
  { state: "current", label: "W realizacji", date: "18.05", icon: "rotate-cw" },
  { state: "pending", label: "Montaż u klienta", date: "23.05", icon: null },
];

export const WORKER_NAME = "Marcel Żyta";
export const WORKER_INITIALS = "MŻ";

export function formatNow(): string {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}.${String(
    now.getMonth() + 1,
  ).padStart(2, "0")} · ${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
}
