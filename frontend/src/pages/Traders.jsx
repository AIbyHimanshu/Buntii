import { Footprints, Smartphone, Store } from "lucide-react";
import { MaskedLines, Reveal, Chapter, Counter, Marquee } from "../components/Motion";
import { WaitlistForm } from "../components/WaitlistForm";
import { track } from "../lib/analytics";

const WHY = [
  {
    title: "More feet through the door.",
    body: "The surplus you'd cut to the bone or throw out, sold instead. Recover the cash, not the bin bag.",
    icon: Footprints,
  },
  {
    title: "No till. No hardware. No faff.",
    body: "Send a WhatsApp or upload an image, and you've posted a deal. Ten seconds and it's live. Nothing to install, nothing to plug in.",
    icon: Smartphone,
  },
  {
    title: "Your shop. Your prices.",
    body: "You decide what's reduced and by how much. Buntii just carries the word down the road.",
    icon: Store,
  },
];

const STEPS = [
  { n: "1", title: "Got surplus? Snap it.", body: "Item, old price, new price. That's the whole form." },
  { n: "2", title: "Shoppers nearby get pinged.", body: "The people who already walk past your shop hear about it in seconds." },
  { n: "3", title: "They come in and buy it. Today. Gone.", body: "Sold instead of binned. Money back in the till." },
];

const SHOP_KINDS = ["Greengrocers.", "Fishmongers.", "Bakers.", "Butchers.", "Market stalls."];

const Traders = () => (
  <main>
    <section className="bg-blush" data-testid="traders-hero">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal y={14}>
          <span className="eyebrow-chip" data-testid="traders-eyebrow">For traders</span>
        </Reveal>
        <h1 className="mt-7 max-w-4xl font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          <MaskedLines
            delay={0.15}
            lines={[
              <span key="a">You already drop your</span>,
              <span key="b">prices at five.</span>,
              <span key="c" className="text-deepjade">Now the whole street will know.</span>,
            ]}
          />
        </h1>
        <Reveal delay={0.5}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slatesage md:text-lg">
            The trays you cut down at close, or bin. Right now nobody outside the shop ever hears about them. Buntii will tell them. You post what you're reducing, we put it online, shoppers get a nudge, they come in before you're done.
          </p>
        </Reveal>
        <Reveal delay={0.65}>
          <button
            className="btn btn-primary mt-9"
            onClick={() => {
              track("waitlist_open", { source: "traders_hero" });
              const el = document.getElementById("trader-waitlist");
              if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -84, duration: 1.3 });
              else if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="traders-join-cta"
          >
            Get in early
          </button>
        </Reveal>
      </div>
    </section>

    <Marquee
      items={SHOP_KINDS.concat(["The independents who know their customers by name."])}
      className="border-y bg-jade py-4 text-ink"
      itemClassName="text-sm"
    />

    <section className="bg-white" data-testid="traders-why">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="01" label="Why Buntii" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.12}>
              <div className="h-full rounded-2xl border bg-white p-8" style={{ borderColor: "var(--hairline)" }} data-testid={`traders-why-${i}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-seamist">
                  <w.icon size={20} className="text-jade" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold leading-snug text-ink">{w.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slatesage">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="rounded-3xl bg-ink px-7 py-12 sm:px-12" data-testid="traders-stat">
            <p className="font-display text-5xl font-extrabold text-jade lg:text-6xl">
              <Counter to={270000} duration={2} />
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-seamist">
              Tonnes of food UK retail bins every year — and under a tenth of it is ever redistributed. Margins are thin enough already. Every tray you sell instead of bin is money back in the till.
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--footer-heading)" }}>WRAP</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="bg-seamist" data-testid="traders-how">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="02" label="How it works" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="h-full rounded-2xl border bg-white p-8" style={{ borderColor: "var(--hairline)" }} data-testid={`traders-step-${s.n}`}>
                <span className="font-display text-4xl font-extrabold text-jade">{s.n}</span>
                <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slatesage">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-12 max-w-2xl text-base leading-relaxed text-ink md:text-lg">
            You've been dropping prices at closing time for years. About time the street showed up for it.
          </p>
        </Reveal>
      </div>
    </section>

    <section id="trader-waitlist" className="bg-blush" data-testid="traders-waitlist">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl lg:text-5xl">
            We're onboarding traders on Green Lanes first<span className="text-jade">.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slatesage md:text-lg">
            In person, shop by shop. Get on the list and we'll come to you before anyone else — zero fee at launch.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <WaitlistForm presetRole="trader" source="traders_page" />
        </Reveal>
      </div>
    </section>
  </main>
);

export default Traders;
