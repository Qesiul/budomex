"use client";

import { useState, type ReactNode } from "react";
import Icon from "./Icon";

type FaqItem = {
  q: string;
  a: ReactNode;
  highlight?: boolean;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Jak długo trwa wycena?",
    a: (
      <>
        Maksymalnie <strong>48&nbsp;godzin roboczych</strong> od&nbsp;momentu,
        gdy dostaniemy twoje zapytanie. W&nbsp;praktyce w&nbsp;2025 średnia
        to&nbsp;31&nbsp;godzin. Jeśli pomiar nie jest konieczny — często
        odpowiadamy tego samego dnia.
      </>
    ),
  },
  {
    q: "Czy robicie pomiar przed wyceną?",
    a: (
      <>
        Tak, jeśli to konieczne — i&nbsp;jest <strong>za&nbsp;darmo</strong>{" "}
        w&nbsp;promieniu 40&nbsp;km od&nbsp;Bydgoszczy. Pomiar wykonuje technik
        z&nbsp;naszego zespołu, nie podwykonawca. Termin pomiaru uzgadniamy
        w&nbsp;ciągu jednej rozmowy.
      </>
    ),
  },
  {
    q: "Jakie są warunki gwarancji?",
    a: (
      <>
        <strong>7&nbsp;lat na montaż</strong> i&nbsp;
        <strong>10&nbsp;lat na profile PCV</strong> (producenta). Gwarancja
        obejmuje pełną naprawę lub wymianę — z&nbsp;naszym dojazdem. Warunki
        zapisane w&nbsp;protokole odbioru, który dostajesz w&nbsp;dniu montażu.
      </>
    ),
  },
  {
    q: "W jakim regionie działacie?",
    a: (
      <>
        <strong>Bydgoszcz</strong> i&nbsp;okolice do&nbsp;ok.&nbsp;60&nbsp;km:
        Osielsko, Solec Kujawski, Białe Błota, Koronowo, Nakło, Inowrocław,
        Toruń. Dla&nbsp;większych zamówień — także dalej, do&nbsp;uzgodnienia
        indywidualnie.
      </>
    ),
  },
  {
    q: "Jakie sposoby płatności akceptujecie?",
    a: (
      <>
        Przelew bankowy w&nbsp;dwóch ratach: <strong>30% zaliczki</strong> po
        akceptacji wyceny, <strong>70% po&nbsp;montażu</strong> i&nbsp;podpisaniu
        protokołu. Możliwa płatność ratalna 0% przez Santander Consumer Bank
        (do&nbsp;36&nbsp;rat, dla&nbsp;zamówień powyżej 5&nbsp;000&nbsp;zł).
      </>
    ),
  },
  {
    q: "Co jeśli termin się przesunie?",
    a: (
      <>
        Uprzedzamy z&nbsp;wyprzedzeniem minimum <strong>7&nbsp;dni</strong>. Każde
        przesunięcie pojawia się w&nbsp;panelu śledzenia z&nbsp;powodem
        (np.&nbsp;&bdquo;czekamy na&nbsp;profil aluminiowy, dostawa
        8.06&rdquo;). Jeśli przesunięcie wynika z&nbsp;naszej winy
        i&nbsp;przekracza 14&nbsp;dni — rabat 2% od&nbsp;wartości zamówienia.
      </>
    ),
  },
  {
    q: "Jak działa śledzenie zamówienia?",
    highlight: true,
    a: (
      <>
        Po&nbsp;akceptacji wyceny dostajesz <strong>unikalny link</strong>{" "}
        (np.&nbsp;<code>budomex.pl/z/BDX-2026-0234</code>). Otwierasz go
        w&nbsp;przeglądarce — bez logowania i&nbsp;bez aplikacji. Widzisz:
        aktualny status, postęp produkcji w&nbsp;procentach, imię montażysty,
        zaplanowaną datę i&nbsp;godziny montażu, każdą zmianę z&nbsp;powodem.
        Dane aktualizują się automatycznie — w&nbsp;praktyce co&nbsp;kilkanaście
        sekund.
      </>
    ),
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Najczęstsze pytania</div>
          <h2>Siedem rzeczy, o&nbsp;które pytają najczęściej.</h2>
          <p className="sub">
            Nie ma tu twojego pytania? Zadzwoń lub napisz — odpowiadamy
            w&nbsp;ciągu jednego dnia roboczego.
          </p>
        </div>
        <div className="faq-wrap">
          <aside className="faq-aside">
            <div className="eyebrow">Wolisz porozmawiać?</div>
            <h3>Złap nas pod telefonem</h3>
            <p>
              W godzinach pracy odbiera Marek lub Ewa — nie infolinia, nie bot.
              Najczęściej da się ustalić wycenę w&nbsp;ciągu jednej rozmowy.
            </p>
            <a href="tel:+48528501200" className="phone-line">
              <Icon name="phone" size={16} />
              +48 52 850 12 00
            </a>
            <div className="faq-meta">
              pon–pt 8:00–17:00 · sob 9:00–13:00
            </div>
          </aside>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div className={`faq-item ${isOpen ? "open" : ""}`} key={i}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{item.q}</span>
                    <span className="chevron">
                      <Icon name="chevron-down" size={16} />
                    </span>
                  </button>
                  <div className="faq-a" aria-hidden={!isOpen}>
                    <div
                      className={`faq-a-inner ${item.highlight ? "highlight" : ""}`}
                    >
                      {item.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
