import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./Wordmark";

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -84, duration: 1.2 });
  else el.scrollIntoView({ behavior: "smooth" });
};

const LINKS = [
  { label: "How it works", to: "/#how-it-works", id: "how-it-works", testId: "nav-how-it-works" },
  { label: "For shoppers", to: "/shoppers", testId: "nav-for-shoppers" },
  { label: "For traders", to: "/traders", testId: "nav-for-traders" },
  { label: "Why Buntii", to: "/#why-buntii", id: "why-buntii", testId: "nav-why-buntii" },
  { label: "FAQ", to: "/#faq", id: "faq", testId: "nav-faq" },
];

export const Nav = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const go = (e, link) => {
    if (link.id && location.pathname === "/") {
      e.preventDefault();
      scrollToId(link.id);
    } else if (link.id) {
      e.preventDefault();
      navigate("/");
      setTimeout(() => scrollToId(link.id), 350);
    }
  };

  const isActive = (link) => link.to === location.pathname;

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_30px_-18px_rgba(10,42,34,0.25)]" : ""
      }`}
      style={{ borderColor: "var(--hairline)" }}
      data-testid="main-nav"
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="Buntii home" data-testid="nav-logo">
          <Wordmark colorway="light" className="text-[26px]" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={(e) => go(e, link)}
              data-testid={link.testId}
              className={`relative text-sm font-medium transition-colors duration-200 ${
                isActive(link) ? "text-deepjade" : "text-ink hover:text-deepjade"
              }`}
            >
              {link.label}
              {isActive(link) && (
                <span className="absolute -bottom-[7px] left-0 h-[2px] w-full bg-jade" aria-hidden="true" />
              )}
            </Link>
          ))}
          <Link
            to="/#waitlist"
            onClick={(e) => go(e, { id: "waitlist" })}
            className="btn btn-primary !px-5 !py-2.5"
            data-testid="nav-join-waitlist"
          >
            Join the waitlist
          </Link>
        </nav>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border lg:hidden"
          style={{ borderColor: "var(--hairline)" }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          data-testid="nav-mobile-toggle"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <nav className="border-t bg-white px-5 pb-6 pt-3 lg:hidden" style={{ borderColor: "var(--hairline)" }} aria-label="Mobile">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={(e) => go(e, link)}
              className="block py-3 text-base font-medium text-ink"
              data-testid={`mobile-${link.testId}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/#waitlist"
            onClick={(e) => go(e, { id: "waitlist" })}
            className="btn btn-primary mt-3 w-full"
            data-testid="mobile-join-waitlist"
          >
            Join the waitlist
          </Link>
        </nav>
      )}
    </header>
  );
};
