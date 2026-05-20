"use client";

import Icon from "./Icon";

const scrollTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">Stolarka otworowa · Bydgoszcz i okolice</div>
            <h1>
              Stolarka otworowa, której{" "}
              <span className="accent">nie&nbsp;musisz pilnować.</span>
            </h1>
            <p className="lead">
              Wyceniamy w&nbsp;48&nbsp;godzin, produkujemy w&nbsp;naszym zakładzie
              i&nbsp;montujemy w&nbsp;umówionym terminie. Postęp śledzisz na unikalnym
              linku, w&nbsp;czasie rzeczywistym — bez telefonów &bdquo;kiedy będzie
              gotowe&rdquo;.
            </p>
            <div className="hero-cta">
              <a href="#wycena" className="btn lg" onClick={scrollTo("#wycena")}>
                Wyceń za darmo
                <Icon name="arrow-right" size={16} />
              </a>
              <a
                href="#proces"
                className="btn outline-light lg"
                onClick={scrollTo("#proces")}
              >
                <Icon name="play" size={14} />
                Zobacz jak to działa
              </a>
            </div>
            <div className="hero-trust">
              <div>
                <div className="stat-num">48&nbsp;h</div>
                <div className="stat-label">Gwarancja wyceny</div>
              </div>
              <div>
                <div className="stat-num">93%</div>
                <div className="stat-label">Terminów dotrzymanych w&nbsp;2025</div>
              </div>
              <div>
                <div className="stat-num">3&nbsp;400+</div>
                <div className="stat-label">Zrealizowanych zamówień</div>
              </div>
              <div>
                <div className="stat-num">7 lat</div>
                <div className="stat-label">Gwarancji na montaż</div>
              </div>
            </div>
          </div>

          <div className="tracking-card-wrap">
            <div className="tc-chip top">
              <Icon name="wifi" size={12} />
              <span>live · aktualizacja co 30&nbsp;s</span>
            </div>
            <article
              className="tracking-card"
              aria-label="Podgląd panelu śledzenia zamówienia"
            >
              <header className="tc-head">
                <div className="ref">
                  Zamówienie · <strong>BDX-2026-0234</strong>
                </div>
                <span className="tc-status-pill">
                  <span className="dot" />
                  W&nbsp;realizacji
                </span>
              </header>
              <div className="tc-body">
                <div className="tc-product">Okna PCV trzyszybowe · 6 szt.</div>
                <div className="tc-product-sub">
                  Dom jednorodzinny · ul. Słoneczna 14, Bydgoszcz
                </div>

                <div className="tc-progress-row">
                  <span className="tc-progress-label">Postęp produkcji</span>
                  <span className="tc-progress-value">65%</span>
                </div>
                <div className="tc-bar">
                  <div className="tc-bar-fill" />
                </div>

                <ul className="tc-steps" role="list">
                  <li className="tc-step">
                    <span className="check">
                      <Icon name="check" size={12} />
                    </span>
                    <span className="label">Pomiar wykonany</span>
                    <span className="meta">02.06</span>
                  </li>
                  <li className="tc-step">
                    <span className="check">
                      <Icon name="check" size={12} />
                    </span>
                    <span className="label">Wycena zaakceptowana</span>
                    <span className="meta">04.06</span>
                  </li>
                  <li className="tc-step">
                    <span className="check active" />
                    <span className="label">Produkcja profili</span>
                    <span className="meta">w&nbsp;trakcie</span>
                  </li>
                  <li className="tc-step">
                    <span className="check pending" />
                    <span className="label muted">Pakowanie i&nbsp;transport</span>
                    <span className="meta">11.06</span>
                  </li>
                  <li className="tc-step">
                    <span className="check pending" />
                    <span className="label muted">Montaż</span>
                    <span className="meta">12.06</span>
                  </li>
                </ul>
              </div>
              <footer className="tc-foot">
                <div className="installer">
                  <span className="avatar">TW</span>
                  <span>
                    Montażysta: <strong>Tomasz Wójcik</strong>
                  </span>
                </div>
                <span>śr. 12.06 · 8:00–10:00</span>
              </footer>
            </article>
            <div className="tc-chip bot">
              <Icon name="check-circle" size={12} />
              <span>termin bez zmian</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
