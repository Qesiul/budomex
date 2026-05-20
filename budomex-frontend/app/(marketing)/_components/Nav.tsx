"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "#oferta", label: "Oferta" },
  { href: "#proces", label: "Proces" },
  { href: "#realizacje", label: "Realizacje" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt" },
] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const hero = document.getElementById("hero");
      if (hero) {
        const bottom = hero.getBoundingClientRect().bottom;
        setOnDark(bottom > 60);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const handleLink = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""} ${onDark ? "on-dark" : ""}`}>
        <a href="#" className="nav-logo" aria-label="Budomex — strona główna">
          <Logo variant={onDark && !scrolled ? "reversed" : "default"} />
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => handleLink(e, l.href)}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-spacer" />
        <a href="tel:+48528501200" className="nav-phone">
          <Icon name="phone" size={14} />
          <span>+48 52 850 12 00</span>
        </a>
        <a
          href="#wycena"
          className="btn"
          onClick={(e) => handleLink(e, "#wycena")}
        >
          Wyceń za 48h
          <Icon name="arrow-right" size={14} />
        </a>
        <button
          type="button"
          className="nav-burger"
          aria-label="Otwórz menu"
          onClick={() => setOpen(true)}
        >
          <Icon name="menu" size={20} />
        </button>
      </nav>

      <div
        className={`drawer-scrim ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="Menu nawigacji"
      >
        <div className="drawer-head">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Zamknij menu"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="drawer-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => handleLink(e, l.href)}>
              {l.label}
              <Icon name="chevron-right" size={16} />
            </a>
          ))}
        </div>
        <a
          href="#wycena"
          className="btn"
          onClick={(e) => handleLink(e, "#wycena")}
        >
          Wyceń za 48h
          <Icon name="arrow-right" size={14} />
        </a>
        <div className="drawer-meta">
          <a href="tel:+48528501200">
            <Icon name="phone" size={12} /> +48 52 850 12 00
          </a>
          <span>pon–pt 8:00–17:00 · sob 9:00–13:00</span>
        </div>
      </aside>
    </>
  );
}
