import Icon from "./Icon";

type Testimonial = {
  name: string;
  initials: string;
  place: string;
  job: string;
  stars: number;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Marek Janicki",
    initials: "MJ",
    place: "Bydgoszcz · Fordon",
    job: "Okna PCV — 12 szt.",
    stars: 5,
    quote:
      "Solidnie, terminowo, bez gadania. Montaż zaczęli o 7:30, skończyli przed 16:00. Polecam.",
  },
  {
    name: "Iwona Kowalczyk",
    initials: "IK",
    place: "Osielsko",
    job: "Drzwi wejściowe + brama",
    stars: 5,
    quote:
      "Wycena przyszła na maila po 31 godzinach. Termin montażu przesunęli o jeden dzień, ale uprzedzili tydzień wcześniej. Konkretni ludzie.",
  },
  {
    name: "Tadeusz Lewandowski",
    initials: "TL",
    place: "Solec Kujawski",
    job: "Rolety zewnętrzne — 9 szt.",
    stars: 5,
    quote:
      "Najbardziej spodobało mi się to, że na stronie widziałem, na jakim etapie jest moje zamówienie. Bez dzwonienia, bez nerwów.",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} z 5 gwiazdek`}>
      {Array.from({ length: n }).map((_, i) => (
        <Icon key={i} name="star" size={14} />
      ))}
    </span>
  );
}

export default function Testimonials() {
  return (
    <section className="section paper-2">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Opinie klientów</div>
          <h2>Co mówią ci, którzy już mieszkają z&nbsp;naszą stolarką.</h2>
        </div>
        <div className="testimonials">
          {TESTIMONIALS.map((t, i) => (
            <article className="testimonial" key={i}>
              <Stars n={t.stars} />
              <blockquote>{t.quote}</blockquote>
              <div className="who">
                <span className="avatar">{t.initials}</span>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="who-meta">
                    {t.place} · {t.job}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
