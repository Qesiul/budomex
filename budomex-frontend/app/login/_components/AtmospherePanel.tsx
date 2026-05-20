import Link from "next/link";
import Logo from "../../(marketing)/_components/Logo";

export default function AtmospherePanel() {
  return (
    <aside className="login-atmos" aria-hidden="false">
      <div className="atmos-top">
        <Logo variant="reversed" />
        <span className="login-shift">
          Hala otwarta · zmiana&nbsp;ranna
        </span>
      </div>

      <div className="atmos-mid">
        <div className="atmos-eyebrow">Budomex OMS · v2.4</div>
        <h1>
          <span className="line">Wycena w 48&nbsp;h.</span>
          <span className="line">Termin dotrzymany.</span>
          <span className="line accent">Rama jak ulał.</span>
        </h1>
        <p className="atmos-sub">
          Zaloguj się, żeby zobaczyć zamówienia przypisane na dzisiaj,
          stany magazynu i&nbsp;zespół na hali.
        </p>
      </div>

      <div className="login-live" aria-label="Podgląd zamówienia w produkcji">
        <div className="live-head">
          <span className="live-ref">
            W produkcji · <strong>BMX-2026-0234</strong>
          </span>
          <span className="live-tag">w trakcie</span>
        </div>
        <div className="live-rows">
          <div className="live-row">
            <span className="k">Produkt</span>
            <span className="v">5× Okno PCV · Toruń</span>
          </div>
          <div className="live-row">
            <span className="k">Montażysta</span>
            <span className="v">Tomasz Wójcik</span>
          </div>
          <div className="live-row">
            <span className="k">Termin montażu</span>
            <span className="v">śr. 23.05 · 8:00–10:00</span>
          </div>
        </div>
        <div className="live-bar" aria-hidden="true">
          <div className="live-bar-fill" />
        </div>
        <div className="live-rows">
          <div className="live-row">
            <span className="k">Postęp produkcji</span>
            <span className="v">65%</span>
          </div>
        </div>
      </div>

      <div className="atmos-foot">
        <Link href="/">Wracam na stronę firmy</Link>
        <span className="build-meta">build 2026.05 · localhost</span>
      </div>
    </aside>
  );
}
