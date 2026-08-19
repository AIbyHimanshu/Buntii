import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { track } from "../lib/analytics";
import { scrollToId } from "./Nav";

const COLUMNS = [
  {
    heading: "SHOPPERS",
    links: [
      { label: "For shoppers", to: "/shoppers", testId: "footer-for-shoppers" },
      { label: "How it works", to: "/#how-it-works", id: "how-it-works", testId: "footer-how-it-works" },
      { label: "FAQ", to: "/#faq", id: "faq", testId: "footer-faq" },
      { label: "Join the waitlist", to: "/#waitlist", id: "waitlist", testId: "footer-join-waitlist" },
    ],
  },
  {
    heading: "TRADERS",
    links: [
      { label: "For traders", to: "/traders", testId: "footer-for-traders" },
      { label: "Get in early", to: "/traders#trader-waitlist", testId: "footer-get-in-early" },
    ],
  },
  {
    heading: "COMPANY",
    links: [
      { label: "Why Buntii", to: "/#why-buntii", id: "why-buntii", testId: "footer-why-buntii" },
      { label: "Privacy", to: "/privacy", testId: "footer-privacy" },
      { label: "Terms", to: "/terms", testId: "footer-terms" },
    ],
  },
];

export const Footer = () => (
  <footer className="bg-ink" data-testid="footer">
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" aria-label="Buntii home">
            <Wordmark colorway="reversed" className="text-3xl" testId="footer-wordmark" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: "var(--footer-heading)" }}>
            Trust your auntie.
          </p>
          <p className="mt-6 text-sm text-seamist">buntii.co.uk</p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.instagram.com/buntii.app/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buntii on Instagram"
              className="link-footer flex h-10 w-10 items-center justify-center rounded-full border border-[#1E443A]"
              onClick={() => track("social_click", { network: "instagram" })}
              data-testid="social-instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://x.com/buntii_app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buntii on X"
              className="link-footer flex h-10 w-10 items-center justify-center rounded-full border border-[#1E443A]"
              onClick={() => track("social_click", { network: "x" })}
              data-testid="social-x"
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--footer-heading)" }}>
              {col.heading}
            </h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={(e) => {
                      if (link.id && window.location.pathname === "/") {
                        e.preventDefault();
                        scrollToId(link.id);
                      }
                    }}
                    className="link-footer text-sm"
                    data-testid={link.testId}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="mt-14 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "#1E443A", color: "var(--footer-heading)" }}
      >
        <p>© {new Date().getFullYear()} Buntii. Starting on Green Lanes, North London.</p>
        <p>North London is the wedge, not the ceiling.</p>
      </div>
    </div>
  </footer>
);
