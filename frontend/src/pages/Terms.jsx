import { Reveal } from "../components/Motion";

const SECTIONS = [
  {
    title: "What this is",
    body: "These terms cover your use of buntii.co.uk, the pre-launch website and waitlist for Buntii. Buntii is not yet a live marketplace: this site explains the idea and gathers a waitlist of shoppers and traders ahead of launch, starting on Green Lanes, North London.",
  },
  {
    title: "Joining the waitlist",
    body: "By joining the waitlist you confirm the details you give us are yours and accurate. Joining the waitlist is not a purchase, a contract for services, or a guarantee of access at launch. We'll email you when Buntii is ready for your street or your shop.",
  },
  {
    title: "Illustrative content",
    body: "Deal cards, prices, savings and shop descriptions shown on this site (for example strawberries at 90p) are illustrative examples of what Buntii will show at launch. They are not live offers, not real inventory, and not available to buy.",
  },
  {
    title: "Acceptable use",
    body: "Don't scrape the site, submit other people's details to the waitlist, or try to break or overload the service. We may remove signups that are clearly fake, abusive, or automated.",
  },
  {
    title: "Intellectual property",
    body: "The Buntii name, wordmark, awning mark, and site content belong to Buntii. Please don't reuse them without asking first.",
  },
  {
    title: "Liability",
    body: "This site is provided as is. To the extent the law allows, Buntii is not liable for losses arising from use of this pre-launch site or reliance on illustrative content. Nothing in these terms limits liability that cannot be limited by law, and your statutory rights are unaffected.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction. Questions? Email legal@buntii.co.uk. Last updated: July 2026.",
  },
];

const Terms = () => (
  <main className="bg-white" data-testid="terms-page">
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
      <Reveal>
        <span className="eyebrow-chip">Terms</span>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Terms of use<span className="text-jade">.</span>
        </h1>
        <p className="mt-4 text-sm text-slatesage">
          The plain-English version of the rules for this pre-launch site and waitlist.
        </p>
      </Reveal>
      <div className="mt-12 space-y-10">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={Math.min(i * 0.05, 0.3)}>
            <h2 className="font-display text-xl font-bold text-deepjade">{s.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </main>
);

export default Terms;
