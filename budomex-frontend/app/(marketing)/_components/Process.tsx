import Icon, { type IconName } from "./Icon";

type Step = {
  n: string;
  t: string;
  d: string;
  meta: string;
  icon: IconName;
};

const STEPS: Step[] = [
  {
    n: "01",
    t: "Wyślij zapytanie",
    d: "Wypełniasz formularz (bez logowania, bez kont) albo dzwonisz. Opisujesz, co potrzebujesz.",
    meta: "dzień 1",
    icon: "file-text",
  },
  {
    n: "02",
    t: "Wycena w 48 h",
    d: "Dostajesz na maila kompletną ofertę: jedna cena, termin produkcji, termin montażu. Akceptacja jednym klikiem.",
    meta: "do 48 h",
    icon: "check-circle",
  },
  {
    n: "03",
    t: "Produkcja",
    d: "Po akceptacji ruszamy z produkcją w naszym zakładzie. Postęp śledzisz na unikalnym linku, na żywo.",
    meta: "7–21 dni",
    icon: "activity",
  },
  {
    n: "04",
    t: "Montaż",
    d: "Przyjeżdżamy w umówionym dniu, w umówionych godzinach. Po skończeniu — protokół i klucz w zamku.",
    meta: "1 dzień",
    icon: "tool",
  },
];

export default function Process() {
  return (
    <section className="section" id="proces">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Jak to działa</div>
          <h2>
            Cztery kroki. Bez &bdquo;to&nbsp;zależy&rdquo; i&nbsp;bez
            &bdquo;oddzwonimy&rdquo;.
          </h2>
          <p className="sub">
            Średnio od&nbsp;wysłania zapytania do&nbsp;zamontowanego okna mija
            19&nbsp;dni roboczych. Na każdym etapie wiesz, co się dzieje
            i&nbsp;kiedy.
          </p>
        </div>
        <div className="process-wrap">
          <div className="process-line" aria-hidden="true" />
          <div className="process-grid">
            {STEPS.map((s, i) => (
              <div
                className={`proc-step ${i === 2 ? "featured" : ""}`}
                key={s.n}
              >
                <div className="proc-num">
                  {s.n}
                  <span className="proc-icon-tag">
                    <Icon name={s.icon} size={14} />
                  </span>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <span className="meta">
                  <Icon name="clock" size={11} />
                  {s.meta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
