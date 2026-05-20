"use client";

import { useCallback, useEffect, useState } from "react";
import Nav from "./Nav";
import Hero from "./Hero";
import Products, { type ProductKey } from "./Products";
import Process from "./Process";
import WhyUs from "./WhyUs";
import Realizacje from "./Realizacje";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Footer from "./Footer";
import Icon from "./Icon";

const PRODUCT_KEYS: ProductKey[] = [
  "okna",
  "drzwi",
  "bramy",
  "rolety",
  "parapety",
];

function readCategoryFromHash(): ProductKey | "" {
  if (typeof window === "undefined") return "";
  const m = window.location.hash.match(/^#wycena-(\w+)$/);
  const key = m?.[1];
  return PRODUCT_KEYS.includes(key as ProductKey) ? (key as ProductKey) : "";
}

export default function LandingPage() {
  const [category, setCategory] = useState<ProductKey | "">("");
  const [showMobileCta, setShowMobileCta] = useState(false);

  useEffect(() => {
    setCategory(readCategoryFromHash());
  }, []);

  const askFor = useCallback((key: ProductKey) => {
    setCategory(key);
    history.replaceState(null, "", `#wycena-${key}`);
    setTimeout(() => {
      document
        .getElementById("wycena")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        document
          .getElementById("f-name")
          ?.focus({ preventScroll: true });
      }, 600);
    }, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      const contact = document.getElementById("wycena");
      if (!hero || !contact) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const contactTop = contact.getBoundingClientRect().top;
      const vh = window.innerHeight;
      setShowMobileCta(heroBottom < 0 && contactTop > vh * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onMobileCta = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById("wycena")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <a href="#oferta" className="skip-link">
        Przejdź do treści
      </a>
      <Nav />
      <main>
        <Hero />
        <Products onAsk={askFor} />
        <Process />
        <WhyUs />
        <Realizacje />
        <Testimonials />
        <FAQ />
        <Contact initialCategory={category} />
      </main>
      <Footer />

      <a
        href="#wycena"
        className={`btn lg mobile-cta ${showMobileCta ? "visible" : ""}`}
        onClick={onMobileCta}
      >
        Wyceń za 48&nbsp;h
        <Icon name="arrow-right" size={16} />
      </a>
    </>
  );
}
