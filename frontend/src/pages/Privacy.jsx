import { Reveal } from "../components/Motion";

const SECTIONS = [
  {
    title: "Who we are",
    body: "Buntii (buntii.co.uk) is a pre-launch local marketplace that connects shoppers with end-of-day price reductions at independent shops, starting on Green Lanes, North London. This policy explains what we collect through this waitlist site and why. Buntii is the data controller for the information described here.",
  },
  {
    title: "What we collect",
    body: "When you join the waitlist we collect your first name, email address, whether you're a shopper or a trader, and your postcode. Traders who choose to continue may also give us their shop name, shop type, and a WhatsApp number. We also record how you found us (referral links and campaign tags) and when you signed up.",
  },
  {
    title: "How we use it",
    body: "We use your details to run the waitlist: to tell you when Buntii launches near you, to prioritise which streets and corridors we switch on next, and — for traders — to arrange onboarding. We do not sell your data, and we do not use it for anything unrelated to Buntii.",
  },
  {
    title: "Analytics and bot protection",
    body: "We use PostHog to understand how the site is used (pages visited, buttons clicked) and Cloudflare Turnstile to keep bots off the waitlist. These services process pseudonymised usage data and device information on our behalf.",
  },
  {
    title: "Who processes your data",
    body: "Your signup is stored in Supabase (Postgres, hosted in the EU/UK region where available). Confirmation emails are sent through Resend. Analytics are processed by PostHog and bot checks by Cloudflare. Each acts as a processor under its own data processing terms.",
  },
  {
    title: "How long we keep it",
    body: "We keep waitlist data until Buntii launches in your area or until you ask us to delete it, whichever comes first. If the waitlist is closed without a launch, we delete it.",
  },
  {
    title: "Your rights",
    body: "Under UK GDPR you can ask to see, correct, export, or delete the data we hold about you, and you can object to or restrict how we use it. To exercise any of these rights, email privacy@buntii.co.uk. You can also complain to the Information Commissioner's Office (ICO) at ico.org.uk.",
  },
  {
    title: "Changes",
    body: "If this policy changes before launch, we'll update this page and note the date below. Last updated: July 2026.",
  },
];

const Privacy = () => (
  <main className="bg-white" data-testid="privacy-page">
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 lg:py-28">
      <Reveal>
        <span className="eyebrow-chip">Privacy</span>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Privacy policy<span className="text-jade">.</span>
        </h1>
        <p className="mt-4 text-sm text-slatesage">
          Short version: we collect what the waitlist needs, we don't sell it, and you can have it back or have it deleted whenever you like.
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

export default Privacy;
