import Icon from "./Icon";

export default function WhyUs() {
  return (
    <section className="section paper-2">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Dlaczego Budomex</div>
          <h2>
            Cztery rzeczy, których nie&nbsp;dostaniesz w&nbsp;markecie budowlanym.
          </h2>
        </div>
        <div className="usp-grid">
          <div className="usp">
            <div className="usp-icon">
              <Icon name="clock" size={22} />
            </div>
            <h3>Wycena w 48&nbsp;h, gwarantowana</h3>
            <p>
              Dwa dni robocze od&nbsp;zapytania do&nbsp;kompletnej oferty
              na&nbsp;mailu. Jeśli nie zdążymy — wycena za&nbsp;darmo, łącznie
              z&nbsp;pomiarem.
            </p>
          </div>

          <div className="usp highlight">
            <div>
              <div className="usp-icon">
                <Icon name="activity" size={22} />
              </div>
              <h3>Śledzenie zamówienia w&nbsp;czasie rzeczywistym</h3>
              <p>
                Po akceptacji wyceny dostajesz unikalny link. Widzisz status
                produkcji, imię montażysty, datę pomiaru i&nbsp;montażu — bez
                logowania, bez aplikacji.
              </p>
            </div>
            <div className="usp-mini" aria-hidden="true">
              <div className="row">
                <span>Produkcja</span>
                <span>
                  <strong>65%</strong>
                </span>
              </div>
              <div className="row">
                <span>Termin</span>
                <span>
                  <strong>śr. 12.06</strong>
                </span>
              </div>
              <div className="row">
                <span>Status</span>
                <span className="live">na żywo</span>
              </div>
            </div>
          </div>

          <div className="usp">
            <div className="usp-icon">
              <Icon name="users" size={22} />
            </div>
            <h3>Lokalny zespół montażowy</h3>
            <p>
              Bez podwykonawców z&nbsp;ogłoszenia. Montaż wykonuje nasz
              pracownik z&nbsp;imienia i&nbsp;nazwiska, z&nbsp;naszym narzędziem
              i&nbsp;naszą odpowiedzialnością.
            </p>
          </div>

          <div className="usp">
            <div className="usp-icon">
              <Icon name="shield-check" size={22} />
            </div>
            <h3>Stała cena, bez niespodzianek</h3>
            <p>
              To, co zaakceptujesz w&nbsp;wycenie, to&nbsp;to&nbsp;co zapłacisz.
              Materiał, dowóz, demontaż starych okien, montaż i&nbsp;listwy
              maskujące w&nbsp;jednej pozycji.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
